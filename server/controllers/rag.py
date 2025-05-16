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

'''

'''
def generate_embedding(test) -> list[float]:
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(test)

    #similarities = model.similarity(embeddings, embeddings)
    
    return embeddings.tolist()
'''

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

'''
def main():
    #user =   sys.argv[1]    
    #query =  sys.argv[2]

    print("in main")
    user = '68221dbc4c9eb42b7d1c3f79'
    query = 'Utilities'

    #process_transaction_embeddings(user)
    process_budget_embeddings(user)
    #process_goal_embeddings(user)

    #set_t = query_documents(user, query, col_t)
    set_b = query_documents(user, query, col_b)
    #set_g = query_documents(user, query, col_g)

    # try:

    #     with open("./server/controllers/results/t_results.json", 'w', encoding="utf-8") as file_t:
    #         json.dump(set_t, file_t, indent=4)
    #     with open("./server/controllers/results/b_results.json", 'w', encoding="utf-8") as file_b:
    #         json.dump(set_b, file_b, indent=4)
    #     with open("./server/controllers/results/g_results.json", 'w', encoding="utf-8") as file_g:
    #         json.dump(set_g, file_g, indent=4)
    #         print(set_t, set_b, set_g)

    # except Exception as e :
    #     print(e)


main()
