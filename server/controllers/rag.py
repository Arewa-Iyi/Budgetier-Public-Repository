'''
 * Name : Arewa (Morountudun) Ojelade
 * Date : 5/15/2025
 * File Name: rag.py
 * 
 * Project : Budgetier Capstone Project Post Capstone Improvements
 * Description : The purpose of the rag.py file is to use 
 * HuggingFace Sentence Transformer to calculate embeddings for the
 * documents in the Budgetier Accounts database. A semantic vector of
 * 384 attributes is embedded in each document in each collection of the
 * Accounts database. When a query is requested, a semantic vector is created
 * and a Vector search is conducted to aggregate matching documents.
 * The aggregated documents and saved to seperate json files for each collection.

'''
import pymongo
import requests
import os
import sys
from dotenv import load_dotenv, dotenv_values
from sentence_transformers import SentenceTransformer
from bson.objectid import ObjectId
import json
load_dotenv()
hf_token = os.getenv("HF_API_KEY")
mongodb_uri = os.getenv("URI")
client = pymongo.MongoClient(mongodb_uri)
db = client.Accounts
col_t = db.Transaction
col_b = db.Budget
col_g = db.Goal
col_s = db.Session
'''
Function to generate semantic vector via HuggingFace Sentence Transformer.
Returns a list of embeddings.
'''
def generate_embedding(test) -> list[float]:
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(test)

    #similarities = model.similarity(embeddings, embeddings)
    
    return embeddings.tolist()
'''
Function to process transaction documents and generate embeddings containing category and description.
'''
def process_transaction_embeddings(user):
    for doc in col_t.find({'userID': ObjectId(user), 'description' : {"$exists" : True}}):      
        cat = doc['category']
        desc = doc['description']
        sentence = cat + " transation : " + desc
        embedding = generate_embedding(sentence)
        doc['desc_embedding'] = embedding
        col_t.replace_one({'_id': doc['_id']}, doc)
'''
Function to process budget documents and generate embeddings containing name, category and description.
'''
def process_budget_embeddings(user):
    for doc in col_b.find({'userID': ObjectId(user), 'description' : {"$exists" : True}}):  
        name = doc['name']
        cat = doc['category']
        desc = doc['description']
        sentence = name + " budget : " + cat + " : " + desc
        embedding = generate_embedding(sentence)
        doc['desc_embedding'] = embedding
        col_b.replace_one({'_id': doc['_id']}, doc)
'''
Function to process goal documents and generate embeddings containing name, category and description.
'''
def process_goal_embeddings(user):
    for doc in col_g.find({'userID': ObjectId(user), 'description' : {"$exists" : True}}):
        name = doc['name']
        cat = doc['category']
        desc = doc['description']
        sentence = name + " goal: " + cat + " : " + desc
        embedding = generate_embedding(sentence)
        doc['desc_embedding'] = embedding
        col_g.replace_one({'_id': doc['_id']}, doc)

'''
Function to process vector search aggregating  documents with similar embedded attributes.
'''
def query_documents(user, query, col):

    query_set = {}
    results = col.aggregate([
        {"$vectorSearch":{
            "queryVector": generate_embedding(query),
            "path": "desc_embedding",
            "numCandidates" : 10,
            "limit" : 10,
            "index" : "vector_index"
        }},
        {"$match" : {'userID' : ObjectId(user)}},
        {"$project" : {'_id' : 1,'userID' : 1,'amount' : 1,'category':1,'description' : 1}}
    ])
    for doc in results:
        print(doc)
        doc['_id'] = str(doc['_id'])
        doc['userID'] = str(doc['userID'])
        query_set.update(doc)

    return query_set

'''
This is the main function that process system arguement, processes and queries embeddings for each collection.
The results and then saved to corresponding json files.
'''
def main():
    user =   sys.argv[1]    
    query =  sys.argv[2]
    hostname = sys.argv[3]
    print("in main")
    

    process_transaction_embeddings(user)
    process_budget_embeddings(user)
    process_goal_embeddings(user)

    set_t = query_documents(user, query, col_t)
    set_b = query_documents(user, query, col_b)
    set_g = query_documents(user, query, col_g)
    
    print("set_t : ", set_t)
    print("set_b : ", set_b)
    print("set_g : ", set_g)
    doc = col_s.update_one({'userID' : ObjectId(user), 'hostname': hostname},
                           {'$set':{
                               'transactionRag' : set_t,
                               'budgetRag' : set_b,
                               'goalRag' : set_g
                           }})

main()