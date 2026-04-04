import argparse
import sys
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, to_date, current_timestamp, datediff, when, desc

def create_spark_session(app_name="CivicPulse_Analytics"):
    return SparkSession.builder \
        .appName(app_name) \
        .master("local[*]") \
        .config("spark.sql.shuffle.partitions", "4") \
        .config("spark.driver.memory", "2g") \
        .getOrCreate()

def run_analytics(spark, input_path, clusters_path, db_url=None, db_user=None, db_password=None):
    print(f"[*] Reading preprocessed complaints from {input_path}")
    
    # Load Main Complaints DataFrame
    complaints_df = spark.read.parquet(input_path)
    complaints_df = complaints_df.withColumn("created_date", to_date(col("created_timestamp")))
    
    # ---------------------------------------------------------
    # 1. Complaints by Category
    # ---------------------------------------------------------
    by_category = complaints_df.groupBy("category").agg(count("complaint_id").alias("total_complaints"))
    print("\n--- Complaints by Category ---")
    by_category.show()

    # ---------------------------------------------------------
    # 2. Complaints by Urgency
    # ---------------------------------------------------------
    by_urgency = complaints_df.groupBy("urgency").agg(count("complaint_id").alias("total_complaints"))
    print("\n--- Complaints by Urgency ---")
    by_urgency.show()

    # ---------------------------------------------------------
    # 3. Complaints by Ward
    # ---------------------------------------------------------
    by_ward = complaints_df.groupBy("ward").agg(count("complaint_id").alias("total_complaints")).orderBy(desc("total_complaints"))
    print("\n--- Complaints by Ward ---")
    by_ward.show(5)

    # ---------------------------------------------------------
    # 4. Daily Complaint Trends
    # ---------------------------------------------------------
    daily_trends = complaints_df.groupBy("created_date").agg(count("complaint_id").alias("daily_count")).orderBy("created_date")
    print("\n--- Daily Trends (Last 5 Days) ---")
    daily_trends.orderBy(col("created_date").desc()).show(5)

    # ---------------------------------------------------------
    # 5. Pending vs Resolved Counts
    # ---------------------------------------------------------
    status_counts = complaints_df.groupBy("status").agg(count("complaint_id").alias("total"))
    print("\n--- Status Breakdown ---")
    status_counts.show()

    # ---------------------------------------------------------
    # 6. SLA Breach Detection
    # If a ticket is Pending/In Progress and older than 2 days, it has breached SLA.
    # ---------------------------------------------------------
    breach_df = complaints_df.withColumn(
        "is_breached",
        when(
            (col("status").isin("Pending", "In Progress")) & 
            (datediff(current_timestamp(), col("created_timestamp")) > 2), 
            1
        ).otherwise(0)
    )
    
    sla_breaches = breach_df.filter(col("is_breached") == 1)\
                            .groupBy("department")\
                            .agg(count("complaint_id").alias("breach_count"))\
                            .orderBy(desc("breach_count"))
                            
    print("\n--- SLA Breaches by Department (> 48h active) ---")
    sla_breaches.show()
    
    # ---------------------------------------------------------
    # 7. Hotspot Clusters & Top Recurring Issues
    # ---------------------------------------------------------
    if clusters_path:
        print(f"[*] Reading incident clusters from {clusters_path}")
        try:
            clusters_df = spark.read.parquet(clusters_path)
            top_hotspots = clusters_df.orderBy(desc("severity_score")).limit(10)
            print("\n--- Top 10 Most Severe City Hotspots ---")
            top_hotspots.select("category", "ward_name", "severity_score", "representative_text").show(truncate=False)
        except Exception as e:
            print(f"Could not load clusters. Run phase 7 first: {e}")

    # ---------------------------------------------------------
    # 8. Write Aggregations to PostgreSQL Dashboards
    # ---------------------------------------------------------
    if db_url and db_user and db_password:
        print("\n[*] Pushing aggregated metrics to PostgreSQL Analytics Schema...")
        write_to_postgres(by_ward, db_url, db_user, db_password, "analytics_by_ward")
        write_to_postgres(daily_trends, db_url, db_user, db_password, "analytics_daily_trends")
        write_to_postgres(status_counts, db_url, db_user, db_password, "analytics_status")
        write_to_postgres(sla_breaches, db_url, db_user, db_password, "analytics_sla_breaches")
        print("[*] Dashboard analytics successfully synchronized!")
    else:
        print("\n[*] Skipping PostgreSQL write (No credentials provided). Use args to configure DB.")
        
def write_to_postgres(df, url, user, password, table_name):
    try:
        df.write.format("jdbc") \
          .option("url", url) \
          .option("dbtable", table_name) \
          .option("user", user) \
          .option("password", password) \
          .option("driver", "org.postgresql.Driver") \
          .mode("overwrite") \
          .save()
    except Exception as e:
        print(f"Failed to write table {table_name} to DB: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CivicPulse AI: Analytics Aggregation Engine")
    parser.add_argument("--complaints", default="./data/complaints_with_clusters.parquet")
    parser.add_argument("--clusters", default="./data/incident_clusters.parquet")
    
    # Postgres Args
    parser.add_argument("--db-url", default=None, help="JDBC URL e.g. jdbc:postgresql://localhost:5432/civicpulse")
    parser.add_argument("--db-user", default=None)
    parser.add_argument("--db-pass", default=None)
    
    args = parser.parse_args()
    
    spark = create_spark_session()
    try:
        run_analytics(spark, args.complaints, args.clusters, args.db_url, args.db_user, args.db_pass)
    except Exception as e:
        print(f"Analytics Pipeline error: {e}", file=sys.stderr)
    finally:
        spark.stop()
