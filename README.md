### Description
This is my capstone project for CMSC 495 Capstone in Computer Science Course for the University of Maryland Global Campus.
The purpose of the Budgetier application is to create a web framework providing users with the ability to manage financial
transactions, budgets and goals.

The application was built with the express build tool, written in javascript, ejs, css, and python.


### Future Improvements :
Since my capstone presentation, I have implemented priority one of my stated future improvements, the search feature.
A RAG pipeline using HuggingFace's Sentence Transformers to embed vectorized attributes of the name, categories, and descriptions of each document in each collection. When a user requests a search, the retrieval mechanism generates an embedding of the query and a vector search is conducted to aggregate the documents most similar to the query. 

####                         May 21st 2025 Updates :
                                                    Restructured session handling from express-session to internal database structure to fix abrupt session end after conducting a search.
                                                    Merged RagSearch with RegExSearch.
