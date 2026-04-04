import argparse
import sys
import uuid
import pandas as pd
import numpy as np
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, pandas_udf, PandasUDFType, count, first, avg
from pyspark.sql.types import (
    StructType, StructField, StringType, DoubleType
)

# ML/NLP imports for the Pandas UDF
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN

def create_spark_session(app_name="CivicPulse_Clustering"):
    return SparkSession.builder \
        .appName(app_name) \
        .master("local[*]") \
        .config("spark.sql.shuffle.partitions", "4") \
        .config("spark.driver.memory", "4g") \
        .getOrCreate()

# Schema for the output of our Pandas UDF (Original Schema + cluster_id)
cluster_schema = StructType([
    StructField("complaint_id", StringType(), True),
    StructField("source", StringType(), True),
    StructField("citizen_name", StringType(), True),
    StructField("language", StringType(), True),
    StructField("original_text", StringType(), True),
    StructField("translated_text", StringType(), True),
    StructField("normalized_text", StringType(), True),
    StructField("ward", StringType(), True),
    StructField("lat", DoubleType(), True),
    StructField("lon", DoubleType(), True),
    StructField("category", StringType(), True),
    StructField("urgency", StringType(), True),
    StructField("department", StringType(), True),
    StructField("status", StringType(), True),
    StructField("created_timestamp", StringType(), True), # For simplicity keeping as string here, can cast later
    StructField("cluster_id", StringType(), True)
])

# Pandas UDF: Runs independently on each Category+Ward partition
@pandas_udf(cluster_schema, PandasUDFType.GROUPED_MAP)
def cluster_complaints_udf(pdf: pd.DataFrame) -> pd.DataFrame:
    """
    Groups duplicated complaints into clusters.
    This runs in parallel across Spark workers for each Ward & Category combination.
    """
    # If a ward/category combo has < 2 complaints, no duplicates can exist
    if len(pdf) < 2:
        pdf["cluster_id"] = [str(uuid.uuid4()) for _ in range(len(pdf))]
        return pdf
        
    texts = pdf["normalized_text"].fillna("").tolist()
    
    # 1. TF-IDF Text Feature Extraction
    try:
        # We use TfidfVectorizer because it's fast, memory efficient, and great for detecting exact/near exact phrase matches
        vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        text_features = vectorizer.fit_transform(texts).toarray()
    except ValueError:
        pdf["cluster_id"] = [str(uuid.uuid4()) for _ in range(len(pdf))]
        return pdf

    # 2. Geospatial Feature Extraction (Lat/Lon)
    # Give geographical coordinates a heavy weight (e.g. 10.0) 
    # to severely penalize matching texts that occurring miles apart.
    coords = pdf[["lat", "lon"]].fillna(0).values
    geo_weight = 10.0  
    geo_features = coords * geo_weight
    
    # Combine text embeddings and geospatial features into one vector
    combined_features = np.hstack((text_features, geo_features))
    
    # 3. DBSCAN Clustering (Density-Based Spatial Clustering of Applications with Noise)
    # Highly suitable because we don't know the expected number of clusters (k) beforehand.
    # eps = distance threshold. min_samples = 1 (every standalone complaint forms a cluster of size 1)
    dbscan = DBSCAN(eps=0.5, min_samples=1, metric='euclidean')
    labels = dbscan.fit_predict(combined_features)
    
    # 4. Assign unique UUIDs to each cluster group
    unique_labels = set(labels)
    label_to_uuid = {lbl: str(uuid.uuid4()) for lbl in unique_labels}
    
    pdf["cluster_id"] = [label_to_uuid[lbl] for lbl in labels]
    return pdf

def run_clustering(spark, input_path, complaints_output, clusters_output):
    print(f"[*] Reading preprocessed complaints from {input_path}")
    df = spark.read.parquet(input_path)
    
    # Need to stringify timestamp temporarily for the UDF schema
    from pyspark.sql.functions import date_format
    df = df.withColumn("created_timestamp", date_format("created_timestamp", "yyyy-MM-dd HH:mm:ss"))
    
    # 1. DISTRIBUTED CLUSTERING
    # By grouping by ward & category, we slice the data into tiny highly-relevant geographic chunks.
    # This proves massive horizontal "Big Data" scalability!
    print("[*] Running distributed TF-IDF + DBSCAN clustering...")
    clustered_df = df.groupBy("ward", "category").apply(cluster_complaints_udf)
    clustered_df.cache() # Cache to avoid re-computing UDF
    
    # 2. SAVE INDIVIDUAL RECORDS (Now carrying their parent cluster_id)
    print(f"[*] Saving uniquely assigned complaints to {complaints_output}")
    clustered_df.write.mode("overwrite").parquet(complaints_output)
    
    # 3. GENERATE AGGREGATED "HOTSPOT/INCIDENT" CLUSTERS TABLE
    # Group the records by their new cluster_id to find repeated issues
    clusters_table = clustered_df.groupBy("cluster_id").agg(
        first("category").alias("category"),
        first("ward").alias("ward_name"),
        avg("lat").alias("center_lat"),
        avg("lon").alias("center_lon"),
        count("complaint_id").alias("severity_score"), # Severity scales with duplicate reports
        first("original_text").alias("representative_text")
    ).filter(col("severity_score") > 1) # Only output actual detected duplicates/hotspots
    
    print("\n[*] Detected Duplicate Hotspot Incidents (severity_score > 1):")
    clusters_table.select("category", "ward_name", "severity_score", "representative_text").show(5, truncate=False)
    
    # Save hotspots
    print(f"[*] Saving clustered incidents to {clusters_output}")
    clusters_table.write.mode("overwrite").parquet(clusters_output)
    print("\n[*] Clustering phase successfully completed!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CivicPulse AI: Duplicate Incident Clustering")
    parser.add_argument("--input", default="./data/processed_complaints.parquet")
    parser.add_argument("--out-complaints", default="./data/complaints_with_clusters.parquet")
    parser.add_argument("--out-clusters", default="./data/incident_clusters.parquet")
    
    args = parser.parse_args()
    
    spark = create_spark_session()
    try:
        run_clustering(spark, args.input, args.out_complaints, args.out_clusters)
    except Exception as e:
        print(f"Pipeline error: {e}", file=sys.stderr)
    finally:
        spark.stop()
