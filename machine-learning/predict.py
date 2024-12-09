import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
from typing import List, Optional
from pydantic import BaseModel
import json
import argparse

class AddressData(BaseModel):
    Address: str
    Avg_min_between_received_tnx: float
    Avg_min_between_sent_tnx: float
    Time_Diff_between_first_and_last_Mins: float
    Sent_tnx: int
    Received_Tnx: int
    Number_of_Created_Contracts: int
    Average_of_Unique_Received_From_Addresses: int
    Average_of_Unique_Sent_To_Addresses: int
    min_value_received: float
    max_value_received: float
    avg_val_received: float
    min_val_sent: float
    max_val_sent: float
    avg_val_sent: float
    total_transactions_including_tnx_to_create_contract: int
    total_Ether_sent: float
    total_ether_received: float
    total_ether_balance: float
    Total_ERC20_tnxs: int
    ERC20_total_Ether_received: float
    ERC20_total_ether_sent: float
    ERC20_total_Ether_sent_contract: float
    ERC20_uniq_sent_addr: int
    ERC20_uniq_rec_addr: int
    ERC20_uniq_sent_addr_1: int
    ERC20_uniq_rec_contract_addr: int
    ERC20_uniq_sent_token_name: int
    ERC20_uniq_rec_token_name: int
    ERC20_most_sent_token_type: Optional[str]
    ERC20_most_rec_token_type: Optional[str]

def prepare_features(df):
    # print("Preparing features...")
    features = df.iloc[:, 2:-4]
    for col in features.columns:
        features[col] = features[col].fillna(features[col].mean())
    return features

def predict(address_data: List[AddressData]):
    # print("Loading model...")
    model = joblib.load("machine-learning/nn_model.pkl")

    try:
        # print("Loading scaler...")
        scaler = joblib.load("machine-learning/scaler.pkl")
    except FileNotFoundError:
        print("Error: scaler.pkl not found. Please ensure the scaler was saved during training.")
        exit(1)

    # print("Converting address data to DataFrame...")
    address_data_df = pd.DataFrame([data.model_dump() for data in address_data])

    # print("Preparing features for prediction...")
    X_new = prepare_features(address_data_df)

    # print("Reindexing features...")
    expected_features = scaler.feature_names_in_
    X_new = X_new.reindex(columns=expected_features, fill_value=0)

    # print("Scaling features...")
    X_new_scaled = scaler.transform(X_new)

    # print("Making predictions...")
    predictions = model.predict(X_new_scaled)
    prediction_proba = model.predict_proba(X_new_scaled)

    # print("Creating results DataFrame...")
    results = pd.DataFrame({
        'Address': address_data_df['Address'],
        'Prediction': predictions,
        'Fraud_Probability': prediction_proba[:, 1]
    })

    return results

if __name__ == "__main__":
    # print("Starting script...")
    parser = argparse.ArgumentParser(description='Predict fraud for given address data.')
    parser.add_argument('address_data', type=str, help='JSON string of address data')
    args = parser.parse_args()

    # print(f"Arguments received: {args.address_data}")

    try:
        # print("Parsing JSON data...")
        address_data_list = json.loads(args.address_data)
        # print(f"Parsed address data list: {address_data_list}")
        address_data = [AddressData(**data) for data in address_data_list]
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        exit(1)
    except TypeError as e:
        print(f"Type error: {e}")
        exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        exit(1)

    try:
        # print("Predicting...")
        results = predict(address_data)
        # print("Prediction complete. Results:")
        print(results.to_json(orient='records'))
    except Exception as e:
        print(f"Error during prediction: {e}")
        exit(1)