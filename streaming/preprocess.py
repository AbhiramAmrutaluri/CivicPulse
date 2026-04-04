import argparse
import sys
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, lower, trim, regexp_replace, to_timestamp, 
    split, when, length
)
from pyspark.sql.types import DoubleType

def create_spark_session(app_name="CivicPulse_Preprocessor"):
    """
    Initialize Spark Session tailored for local development/hackathon scale.
     Limits memory and shuffle partitions to keep execution snappy on a laptop.
    """
    return SparkSession.builder \
        .appName(app_name) \
        .master("local[*]") \
        .config("spark.sql.shuffle.partitions", "4") \
        .config("spark.driver.memory", "2g") \
        .getOrCreate()

def preprocess_complaints(spark, input_path, output_path):
    """
    Reads raw CSV data, cleans nulls, normalizes text signals, 
    extracts geospatial float values from strings, and prepares 
    the text for TF-IDF / NLP clustering.
    """
    print(f"[*] Loading raw batch data from: {input_path}")
    
    # 1. Load Data
    raw_df = spark.read.csv(input_path, header=True, inferSchema=True)
    
    # 2. Remove Junk & Empty
    # Drop records missing an ID or containing suspiciously short complaint bodies
    df = raw_df.filter(
        col("complaint_id").isNotNull() & 
        (length(col("original_text")) > 5)
    )
    
    # 3. Handle Missing Translations
    # If English ground-truth is missing, fallback to the original text
    df = df.withColumn(
        "processed_text", 
        when(col("translated_text").isNull(), col("original_text"))
        .otherwise(col("translated_text"))
    )
    
    # 4. Text Normalization for downstream AI / Duplicate Clustering
    # Lowercase -> Trim -> Strip all punctuation leaving only words and spaces
    df = df.withColumn(
        "normalized_text",
        trim(lower(regexp_replace(col("processed_text"), r'[^\w\s]', '')))
    )
    
    # 5. Timestamp Conversion
    df = df.withColumn("created_timestamp", to_timestamp(col("created_at"), "yyyy-MM-dd HH:mm:ss"))
    
    # 6. Geospatial Extraction (Location to Lat/Lon floats)
    # Simulator provides "lat, lon". We separate these for Postgres B-Tree indexing.
    df = df.withColumn("lat_str", split(col("location"), ",").getItem(0)) \
           .withColumn("lon_str", split(col("location"), ",").getItem(1))
           
    df = df.withColumn("lat", trim(col("lat_str")).cast(DoubleType())) \
           .withColumn("lon", trim(col("lon_str")).cast(DoubleType())) \
           .drop("lat_str", "lon_str", "location")
           
    # 7. Normalize Categorical Data
    df = df.withColumn("ward_normalized", trim(col("ward")))
           
    # 8. Clean Nulls Checkpoint
    clean_df = df.filter(
        col("lat").isNotNull() & 
        col("lon").isNotNull() & 
        col("created_timestamp").isNotNull()
    )
    
    # Final Selection & Restructuring
    final_df = clean_df.select(
        "complaint_id", "source", "citizen_name", "language",
        "original_text", "translated_text", "normalized_text",
        col("ward_normalized").alias("ward"), 
        "lat", "lon", "category", "urgency", "department", 
        "status", "created_timestamp"
    )
    
    print("\n[*] Preprocessing step complete. Schema:")
    final_df.printSchema()
    
    print(f"\n[*] Sample Transformed Output (Total Count: {final_df.count()}):")
    final_df.show(3, truncate=False)
    
    # 9. Save Processed Output
    print(f"\n[*] Writing optimized pipeline data to: {output_path}")
    final_df.write.mode("overwrite").parquet(output_path)
    print("[*] Pipeline job finished successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CivicPulse PySpark Preprocessing Pipeline")
    # For Phase 6 testing, we default to reading the local CSV from the data simulator directory
    parser.add_argument("--input", default="../data-simulator/civicpulse_sample.csv")
    parser.add_argument("--output", default="./data/processed_complaints.parquet")
    
    args = parser.parse_args()
    
    spark = create_spark_session()
    
    try:
        preprocess_complaints(spark, args.input, args.output)
    except Exception as e:
        print(f"[!] Critical PySpark pipeline failure: {e}", file=sys.stderr)
    finally:
        spark.stop()
