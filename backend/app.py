from flask import Flask, request, jsonify, send_from_directory
# from chatbot_graph import ChatBotGraph
from flask_cors import CORS
import traceback
from question_classifier import QuestionClassifier
from question_parser import QuestionPaser
from answer_search import AnswerSearcher
app = Flask(__name__,static_folder='../frontend',static_url_path='/static')
CORS(app)
class ChatBotGraph1:
    def __init__(self):
        self.classifier = QuestionClassifier()
        self.parser = QuestionPaser()
        self.searcher = AnswerSearcher()

    def chat_main(self, sent):
        answer = '很抱歉，没有找到相关信息。'
        res_classify = self.classifier.classify(sent)
        if not res_classify:
            return answer
        res_sql = self.parser.parser_main(res_classify)
        final_answers = self.searcher.search_main(res_sql)
        if final_answers:
            answer = '\n'.join(final_answers)
        return answer, res_sql  # 返回答案和 SQL 查询语句
chatbot = ChatBotGraph1()

# 根路径路由，返回前端页面
@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')


# 问答接口
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get('question')
    if question:
        answer , res_sql = chatbot.chat_main(question)
        return jsonify({"answer": answer, "queries": [sql_['sql'] for sql_ in res_sql]})
    return jsonify({"error": "未提供问题"}), 400

# @app.route('/query_graph', methods=['POST'])
# def query_graph():
#     try:
#         from build_medicalgraph import MedicalGraph
#         graph = MedicalGraph()
#         data = request.get_json()
#         node_name = data.get('node_name')
#         edge_relation = data.get('edge_relation')

#         if node_name and edge_relation:
#             cypher_query = f"""
#             MATCH (n)-[r:{edge_relation}]->(m) 
#             WHERE n.name = '{node_name}' 
#             RETURN DISTINCT n, r, m
#             """
#         elif node_name:
#             cypher_query = f"""
#             MATCH (n)-[r]-(m) 
#             WHERE n.name = '{node_name}' 
#             RETURN DISTINCT n, r, m
#             """
#         else:
#             return jsonify({"error": "请提供节点名称"}), 400

#         result = graph.g.run(cypher_query).data()
#         nodes = []
#         edges = []
#         node_set = set()

#         for record in result:
#             # 处理节点 n
#             if record['n'].identity not in node_set:
#                 node_n = {
#                     "id": int(record['n'].identity),  # 确保 id 为整数
#                     "label": str(record['n']['name']),  # 确保 label 为字符串
#                     "name": str(record['n']['name'])  # 确保 name 为字符串
#                 }
#                 nodes.append(node_n)
#                 node_set.add(record['n'].identity)

#             # 处理节点 m
#             if record['m'].identity not in node_set:
#                 node_m = {
#                     "id": int(record['m'].identity),  # 确保 id 为整数
#                     "label": str(record['m']['name']),  # 确保 label 为字符串
#                     "name": str(record['m']['name'])  # 确保 name 为字符串
#                 }
#                 nodes.append(node_m)
#                 node_set.add(record['m'].identity)

#             # 处理边
#             edge = {
#                 "from": int(record['n'].identity),  # 确保 from 为整数
#                 "to": int(record['m'].identity),  # 确保 to 为整数
#                 "type": str(type(record['r']).__name__),  # 确保 type 为字符串
#                 "relation": str(record['r'].type)  # 确保 relation 为字符串
#             }
#             edges.append(edge)

#         return jsonify({"nodes": nodes, "edges": edges})
#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500
# ... 已有代码 ...

# ... 已有代码 ...

@app.route('/query_graph', methods=['POST'])
def query_graph():
    try:
        from build_medicalgraph import MedicalGraph
        graph = MedicalGraph()
        data = request.get_json()
        node_name = data.get('node_name')
        edge_relation = data.get('edge_relation')

        if node_name and edge_relation:
            # 处理多个关系，用 | 分隔
            cypher_query = f"""
            MATCH (n)-[r:{edge_relation}]->(m) 
            WHERE n.name = '{node_name}' 
            RETURN DISTINCT n, r, m
            UNION
            MATCH (n)<-[r:{edge_relation}]-(m) 
            WHERE n.name = '{node_name}' 
            RETURN DISTINCT n, r, m
            """
        elif node_name:
            cypher_query = f"""
            MATCH (n)-[r]-(m) 
            WHERE n.name = '{node_name}' 
            RETURN DISTINCT n, r, m
            """
        else:
            return jsonify({"error": "请提供节点名称"}), 400

        result = graph.g.run(cypher_query).data()
        nodes = []
        edges = []
        node_set = set()

        for record in result:
            # 处理节点 n
            if record['n'].identity not in node_set:
                node_n = {
                    "id": int(record['n'].identity),
                    "label": str(record['n']['name']),
                    "name": str(record['n']['name'])
                }
                nodes.append(node_n)
                node_set.add(record['n'].identity)

            # 处理节点 m
            if record['m'].identity not in node_set:
                node_m = {
                    "id": int(record['m'].identity),
                    "label": str(record['m']['name']),
                    "name": str(record['m']['name'])
                }
                nodes.append(node_m)
                node_set.add(record['m'].identity)

            # 处理边
            edge = {
                "from": int(record['n'].identity),
                "to": int(record['m'].identity),
                "type": str(type(record['r']).__name__),
                "relation": str(record['r'].type)
            }
            edges.append(edge)

        return jsonify({"nodes": nodes, "edges": edges})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ... 已有代码 ...

# ... 已有代码 ...

# # 新增 qa 页面路由
# @app.route('/qa.html')
# def qa_page():
#     return send_from_directory('../frontend', 'qa.html')

if __name__ == '__main__':
    app.run(debug=True)