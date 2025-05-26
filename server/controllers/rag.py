'''
 * Name : Arewa (Morountudun) Ojelade
 * Date : 10/15/2025
 * File Name: rag.py
 * 
 * Project : Budgetier Capstone Project Post Capstone Improvements
 * Description : The purpose of the rag.py file is to use 
 * HuggingFace Sentence Transformer all-MiniLM-L6-v2 LLM to calculate 
 * embeddings for the documents in the Budgetier Accounts database.
 * A semantic vector of 384 attributes is embedded in each document 
 * in each specified collection of the Accounts database. When a query is requested, 
 * a semantic vector is created and a manual dot product search is conducted to aggregate 
 * 10 most similar documents. The aggregated documents are saved to seperate json files 
 * for each collection.

 References : 
    freeCodeCamp.org. (2023, December 11). Vector Search RAG Tutorial – Combine Your Data with LLMs with Advanced Search. 
        YouTube. https://www.youtube.com/watch?v=JEBDfGqrAUA&list=PL6GWKX4_k1y0u3ib3vlhn6qcrCvsC5ofN&index=2
    MongoDB. (2024, August 15). Building a RAG Pipeline in JavaScript with Memory. 
        YouTube. https://www.youtube.com/watch?v=EcZMe8yOcs8&list=PL6GWKX4_k1y0u3ib3vlhn6qcrCvsC5ofN
'''
import pymongo
import os
import sys
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from bson.objectid import ObjectId
import json
import numpy as np
load_dotenv()

# Retrieve the hugging face token from the .env file
hf_token = os.getenv("HF_API_KEY")

# Retrieve the mongodb uri from the .env file
mongodb_uri = os.getenv("URI")

#Initialize mongodb client and retrieve necessary collections
client = pymongo.MongoClient(mongodb_uri)

db = client.Accounts   # Retrieve Accounts database
col_t = db.Transaction # Retrieve the Transaction collection
col_b = db.Budget      # Retrieve the Budget collection
col_g = db.Goal        # Retrieve the Goal collection

'''
Function to generate semantic vector via HuggingFace Sentence Transformer,
using the 'all-MiniLM-L6-v2' LLM model. Returns a list of embeddings.
'''
def generate_embedding(test) -> list[float]:
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(test)
    return embeddings.tolist()

'''
    Function to process and generate embeddings from the category and description 
    of each transaction document with parameterized userID.
'''
def process_transaction_embeddings(userID):

    # Iterate through each transaction document with paramenterized userID
    for doc in col_t.find({'userID': ObjectId(userID), 'description' : {"$exists" : True}}):      
        cat = doc['category']
        desc = doc['description']

        # construct a sentence to include transaction's category and description
        sentence = cat + " transation : " + desc
        
        # generate an embedding of the sentence
        embedding = generate_embedding(sentence)

        # assign embedding to the desc_embedding field
        doc['desc_embedding'] = embedding
        col_t.replace_one({'_id': doc['_id']}, doc)

'''
    Function to process and generate embeddings from the name, category, and description 
    of each budget document with parameterized userID.
'''
def process_budget_embeddings(userID):

    # Iterate through each budget document with paramenterized userID
    for doc in col_b.find({'userID': ObjectId(userID), 'description' : {"$exists" : True}}):  
        name = doc['name']
        cat = doc['category']
        desc = doc['description']

        # construct a sentence to include budget's name, category and description
        sentence = name + " budget : " + cat + " : " + desc

        # generate an embedding of the sentence
        embedding = generate_embedding(sentence)

        # assign embedding to the desc_embedding field
        doc['desc_embedding'] = embedding
        col_b.replace_one({'_id': doc['_id']}, doc)

'''
    Function to process generate embeddings from the name, category, and description 
    of each goal document with parameterized userID.
'''
def process_goal_embeddings(userID):

    # Iterate through each budget document with paramenterized userID
    for doc in col_g.find({'userID': ObjectId(userID), 'description' : {"$exists" : True}}):
        name = doc['name']
        cat = doc['category']
        desc = doc['description']

        # Iterate through each budget document with paramenterized userID
        sentence = name + " goal: " + cat + " : " + desc

        # generate an embedding of the sentence
        embedding = generate_embedding(sentence)

        # assign embedding to the desc_embedding field
        doc['desc_embedding'] = embedding
        col_g.replace_one({'_id': doc['_id']}, doc)

'''
    Function to process vector search aggregating documents with similar embedded attributes to
    parameterized query in provided collection matching userID.
'''
def vector_search_query(userID, query, col):

    query_set = {}

    # generate embedding from parameterized query
    embedding = generate_embedding(query)

    # Aggregate 10 most similar documents to query from parameterized collection
    results = col.aggregate([
        {"$vectorSearch":{
            "queryVector": embedding,
            "path": "desc_embedding",  # assign embedding to the desc-embedding field
            "numCandidates" : 100,
            "limit" : 10,
            "index" : "SemanticSearch"  # use the SemanticSearch index
        }},
        {"$match" : {'userID' : ObjectId(userID)}},  # from documents matching the userID

        {"$project" : {'_id' : 1,'userID' : 1,'amount' : 1,  # Return results with provided fields
                       'date' : 1, 'type' : 1, 'savedAmount' : 1,
                       'spentAmount' : 1,'category':1,'description' : 1}}
    ])

    for doc in results:
        # Update all documents with stringified  ObjectId
        doc['_id'] = str(doc['_id'])
        doc['userID'] = str(doc['userID'])
        query_set.update(doc)

    return query_set

'''
    Function to manually aggregate documents with similar embedded attributes to
    parameterized query in the Transaction Collection of the Budgetier Accounts Database.
    The manual implementation provides greater control of the aggregation process and ensures
    quality control of results.
'''
def my_query_transactions(userID, query):

    dot_product_list = []

    # Generate embedding of user query
    embedding = generate_embedding(query)    

    # Find all documents that have vectorized embedings matching the parameterized userID
    results = col_t.find({'userID': ObjectId(userID),'desc_embedding' : {"$exists" : True}})
    
    # Stringify appropriate fields to write to json file
    for doc in results: 
        description = doc['desc_embedding']

        save = {
            "_id" : str(doc['_id']),
            "userID" : str(doc['userID']),
            "amount" : doc['amount'],
            "date" : str(doc['date']),
            "type": doc['type'],
            "category" : doc['category'],
            "description" : doc['description']
        }
        ''' Append an array of 'save' fields and the dot product of the 
            query embedding and the desc_embedding to the dot product list.
        '''
        dot_product_list.append([save, np.dot(np.array(description), np.array(embedding))])

    '''
        Sort the dot_product_list in descending order of the dot product. The documents
        with larger dot procuct values are most similar to the query. Assign only the 
        index containing the 'save' documents to the result variable.
    '''
    result = np.array(sorted(dot_product_list, key=lambda x: x[1], reverse=True))[:, 0]   
 
    # Save the result to the t_results.json file
    try:
        with open("./server/controllers/results/t_results.json", 'w', encoding="utf-8") as file_t:
            json.dump(result.tolist()[:10], file_t, indent=4)
    except Exception as e :
        print(e)
       
def my_query_budgets(userID, query):
    
    dot_product_list = []
    
    # Generate embedding of user query
    embedding = generate_embedding(query)

    # Find all documents that have vectorized embedings matching the parameterized userID
    results = col_b.find({'userID': ObjectId(userID),'desc_embedding' : {"$exists" : True}})
    
    # Stringify appropriate fields to write to json file
    for doc in results: 
        description = doc['desc_embedding']
        save = {
            "_id" : str(doc['_id']),
            "userID" : str(doc['userID']),
            "name" : doc['name'],
            "amount" : doc['amount'],
            "spentAmount" : doc['spentAmount'],
            "category" : doc['category'],
            "description" : doc['description']
        }

        ''' Append an array of the 'save' fields and the dot product of the 
            query embedding and the desc_embedding to the dot product list.
        '''
        dot_product_list.append([save, np.dot(np.array(description), np.array(embedding))])

    '''
        Sort the dot_product_list in descending order of the dot product. The documents
        with larger dot procuct values are most similar to the query. Assign only the 
        index containing the 'save' documents to the result variable.
    '''
    result = np.array(sorted(dot_product_list, key=lambda x: x[1], reverse=True))[:, 0]

    # Save the result to the b_results.json file
    try:
        with open("./server/controllers/results/b_results.json", 'w', encoding="utf-8") as file_b:
            json.dump(result.tolist()[:10], file_b, indent=4)
    except Exception as e :
        print(e)

def my_query_goals(userID, query):

    dot_product_list = []

    # Generate embedding of user query  
    embedding = generate_embedding(query)

    # Find all documents that have vectorized embedings matching the parameterized userID
    results = col_g.find({'userID': ObjectId(userID),'desc_embedding' : {"$exists" : True}})
    
    # Stringify appropriate fields to write to json file
    for doc in results: 
        description = doc['desc_embedding']
        save = {
            "_id" : str(doc['_id']),
            "userID" : str(doc['userID']),
            "name" : doc['name'],
            "targetAmount" : doc['targetAmount'],
            "savedAmount" : doc['savedAmount'],
            "category" : doc['category'],
            "description" : doc['description']
        }
        
        ''' Append an array of the 'save' fields and the dot product of the 
            query embedding and the desc_embedding to the dot product list.
        '''
        dot_product_list.append([save, np.dot(np.array(description), np.array(embedding))])

    '''
        Sort the dot_product_list in descending order of the dot product. The documents
        with larger dot procuct values are most similar to the query. Assign only the 
        index containing the 'save' documents to the result variable.
    ''' 
    result = np.array(sorted(dot_product_list, key=lambda x: x[1], reverse=True))[:, 0]
   
     # Save the result list to the g_results.json file
    try:
        with open("./server/controllers/results/g_results.json", 'w', encoding="utf-8") as file_g:
            json.dump(result.tolist()[:10], file_g, indent=4)
    except Exception as e :
        print(e)
'''
    This is the main function that processes system arguements, and embeddings for each collection.
    Generates a dot product search and saves the results to the corresponding json files.
'''
def main():
    userID =   sys.argv[1]
    query =  sys.argv[2]

    process_transaction_embeddings(userID)
    process_budget_embeddings(userID)
    process_goal_embeddings(userID)

    my_query_transactions(userID, query)
    my_query_budgets(userID, query)
    my_query_goals(userID, query )

main()
