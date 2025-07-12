// let mainNetwork;
// let qaNetwork;

// // 切换问答界面显示
// function toggleQA() {
//     const qaContainer = document.getElementById('qa-container');
//     qaContainer.style.display = qaContainer.style.display === 'none' ? 'block' : 'none';
// }

// // 知识图谱可视化查询
// function searchGraph() {
//     const nodeInput = document.getElementById('node-input');
//     const edgeInput = document.getElementById('edge-input');
//     const nodeName = nodeInput.value.trim();
//     const edgeRelation = edgeInput.value.trim();

//     if (nodeName) {
//         fetch('http://localhost:5000/query_graph', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ node_name: nodeName, edge_relation: edgeRelation })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 alert(data.error);
//             } else {
//                 renderGraph(data, 'main-graph');
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             alert('请求出错，请稍后再试');
//         });
//     } else {
//         alert('请输入节点名称');
//     }
// }


// // 问答功能
// function askQuestion() {
//     const questionInput = document.getElementById('question-input');
//     const question = questionInput.value.trim();
//     if (question) {
//         addMessage(question, 'user');
//         fetch('http://localhost:5000/ask', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ question: question })
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('网络响应失败');
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.error) {
//                 addMessage(data.error, 'bot');
//             } else {
//                 addMessage(data.answer, 'bot');
//                 // 处理查询语句，提取节点和关系
//                 const queries = [];
//                 // 扁平化处理 queries 数据
//                 data.queries.forEach(subQueries => {
//                     if (Array.isArray(subQueries)) {
//                         subQueries.forEach(query => {
//                             if (typeof query === 'string') {
//                                 queries.push(query);
//                             }
//                         });
//                     } else if (typeof subQueries === 'string') {
//                         queries.push(subQueries);
//                     }
//                 });

//                 const nodeNames = new Set();
//                 const edgeRelations = new Set();

//                 queries.forEach(query => {
//                     const nodeNameMatch = query.match(/where m\.name = '([^']+)'/);
//                     if (nodeNameMatch) {
//                         nodeNames.add(nodeNameMatch[1]);
//                     }
//                     const edgeRelationMatch = query.match(/MATCH \(m:([^:]+)\)-\[r:([^]]+)\]/);
//                     if (edgeRelationMatch) {
//                         edgeRelations.add(edgeRelationMatch[2]);
//                     }
//                 });

//                 // 取第一个节点和关系进行知识图谱查询
//                 const nodeName = nodeNames.values().next().value;
//                 const edgeRelation = edgeRelations.values().next().value;

//                 if (nodeName) {
//                     // 查询问答相关知识图谱
//                     fetch('http://localhost:5000/query_graph', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json'
//                         },
//                         body: JSON.stringify({ node_name: nodeName, edge_relation: edgeRelation || '' })
//                     })
//                     .then(graphResponse => {
//                         if (!graphResponse.ok) {
//                             throw new Error('知识图谱查询网络响应失败');
//                         }
//                         return graphResponse.json();
//                     })
//                     .then(graphData => {
//                         if (!graphData.error) {
//                             // 显示问答相关知识图谱
//                             renderGraph(graphData, 'qa-graph');
//                         }
//                     })
//                     .catch(graphError => {
//                         console.error('知识图谱查询出错:', graphError);
//                         addMessage('知识图谱查询出错，请稍后再试', 'bot');
//                     });
//                 }
//             }
//         })
//         .catch(error => {
//             console.error('问答请求出错:', error);
//             addMessage('问答请求出错，请稍后再试', 'bot');
//         });
//         questionInput.value = '';
//     }
// }


// // 添加聊天消息
// function addMessage(text, sender) {
//     const chatHistory = document.getElementById('chat-history');
//     const messageDiv = document.createElement('div');
//     messageDiv.className = `message ${sender}-message`;
//     messageDiv.textContent = text;
//     chatHistory.appendChild(messageDiv);
//     chatHistory.scrollTop = chatHistory.scrollHeight;
// }

// // 渲染知识图谱
// function renderGraph(data, containerId) {
//     const nodes = new vis.DataSet(data.nodes);
//     const edges = new vis.DataSet(data.edges.map(edge => ({
//         from: edge.from,
//         to: edge.to,
//         arrows: 'to',
//         label: edge.type,
//         font: {
//             size: 12,
//             align: 'middle'
//         }
//     })));
//     const container = document.getElementById(containerId);
//     const dataVis = {
//         nodes: nodes,
//         edges: edges
//     };
//     const options = {
//         nodes: {
//             shape: 'box'
//         },
//         edges: {
//             labelHighlightBold: true,
//             arrows: 'to',
//             font: {
//                 size: 12
//             }
//         },
//         interaction: {
//             hover: true
//         },
//         physics: {
//             stabilization: true
//         }
//     };

//     if (containerId === 'main-graph') {
//         if (mainNetwork) {
//             mainNetwork.destroy();
//         }
//         mainNetwork = new vis.Network(container, dataVis, options);
//     } else {
//         if (qaNetwork) {
//             qaNetwork.destroy();
//         }
//         qaNetwork = new vis.Network(container, dataVis, options);
//     }
// }

let mainNetwork;
let qaNetwork;
let isResizing = false;
const resizer = document.getElementById('resizer');
const leftPanel = document.querySelector('.graph-container');
const rightPanel = document.getElementById('qa-container');

// 切换问答界面显示
function toggleQA() {
    const qaContainer = document.getElementById('qa-container');
    qaContainer.style.display = qaContainer.style.display === 'none' ? 'block' : 'none';
}

// 拖动分隔线逻辑
resizer.addEventListener('mousedown', (e) => {
    const qaContainer = document.getElementById('qa-container');
    if (qaContainer.style.display === 'block') {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
    }
});

document.addEventListener('mousemove', (e) => {
    const qaContainer = document.getElementById('qa-container');
    if (isResizing && qaContainer.style.display === 'block') {
        const container = document.querySelector('.main-content');
        const containerRect = container.getBoundingClientRect();
        const x = e.clientX - containerRect.left;

        // 限制最小宽度
        const minWidth = 200;
        if (x >= minWidth && containerRect.width - x - resizer.offsetWidth >= minWidth) {
            leftPanel.style.width = `${x}px`;
            rightPanel.style.width = `calc(100% - ${x + resizer.offsetWidth}px)`;
        }
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
    }
});

// 知识图谱可视化查询
function searchGraph() {
    const nodeInput = document.getElementById('node-input');
    const edgeInput = document.getElementById('edge-input');
    const nodeName = nodeInput.value.trim();
    const edgeRelation = edgeInput.value.trim();

    if (nodeName) {
        fetch('http://localhost:5000/query_graph', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ node_name: nodeName, edge_relation: edgeRelation })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                renderGraph(data, 'main-graph');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('请求出错，请稍后再试');
        });
    } else {
        alert('请输入节点名称');
    }
}

// ... 已有代码 ...
// 问答功能
function askQuestion() {
    const questionInput = document.getElementById('question-input');
    const question = questionInput.value.trim();
    if (question) {
        addMessage(question, 'user');
        fetch('http://localhost:5000/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: question })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应失败');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                addMessage(data.error, 'bot');
            } else {
                addMessage(data.answer, 'bot');
                // 处理查询语句，提取节点和关系
                const queries = [];
                // 扁平化处理 queries 数据
                data.queries.forEach(subQueries => {
                    if (Array.isArray(subQueries)) {
                        subQueries.forEach(query => {
                            if (typeof query === 'string') {
                                queries.push(query);
                            }
                        });
                    } else if (typeof subQueries === 'string') {
                        queries.push(subQueries);
                    }
                });

                const nodeNames = new Set();
                const edgeRelations = new Set();

                queries.forEach(query => {
                    const nodeNameMatch = query.match(/where m\.name = '([^']+)'/);
                    if (nodeNameMatch) {
                        nodeNames.add(nodeNameMatch[1]);
                    }
                    const edgeRelationMatch = query.match(/MATCH \(m:([^:]+)\)-\[r:([^]]+)\]/);
                    if (edgeRelationMatch) {
                        edgeRelations.add(edgeRelationMatch[2]);
                    }
                });

                // 取第一个节点和关系进行知识图谱查询
                const nodeName = nodeNames.values().next().value;
                const edgeRelation = edgeRelations.values().next().value;

                if (nodeName) {
                    // 查询问答相关知识图谱
                    fetch('http://localhost:5000/query_graph', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ node_name: nodeName, edge_relation: edgeRelation || '' })
                    })
                    .then(graphResponse => {
                        if (!graphResponse.ok) {
                            throw new Error('知识图谱查询网络响应失败');
                        }
                        return graphResponse.json();
                    })
                    .then(graphData => {
                        if (!graphData.error) {
                            // 显示问答相关知识图谱
                            renderGraph(graphData, 'qa-graph');
                        }
                    })
                    .catch(graphError => {
                        console.error('知识图谱查询出错:', graphError);
                        addMessage('知识图谱查询出错，请稍后再试', 'bot');
                    });
                }
            }
        })
        .catch(error => {
            console.error('问答请求出错:', error);
            addMessage('问答请求出错，请稍后再试', 'bot');
        });
        questionInput.value = '';
    }
}


// 添加聊天消息
function addMessage(text, sender) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// 渲染知识图谱
function renderGraph(data, containerId) {
    const nodes = new vis.DataSet(data.nodes);
    const edges = new vis.DataSet(data.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        arrows: 'to',
        label: edge.type,
        font: {
            size: 12,
            align: 'middle'
        }
    })));
    const container = document.getElementById(containerId);
    const dataVis = {
        nodes: nodes,
        edges: edges
    };
    const options = {
        nodes: {
            shape: 'box'
        },
        edges: {
            labelHighlightBold: true,
            arrows: 'to',
            font: {
                size: 12
            }
        },
        interaction: {
            hover: true
        },
        physics: {
            stabilization: true
        }
    };

    if (containerId === 'main-graph') {
        if (mainNetwork) {
            mainNetwork.destroy();
        }
        mainNetwork = new vis.Network(container, dataVis, options);
    } else {
        if (qaNetwork) {
            qaNetwork.destroy();
        }
        qaNetwork = new vis.Network(container, dataVis, options);
    }
}
