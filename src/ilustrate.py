# Libraries
import matplotlib.pyplot as plt
import networkx as nx
from flask import Flask

app = Flask(__name__)

@app.route("/VisualizeGraph")
def VisualizeGraph (adjMatrix):
    # Inisiasi graf
    g = nx.Graph()

    # Mengisi elemen graf dengan elemen matriks ketetangaan
    for i in range (len(adjMatrix)) :
        g.add_node(i)
        for j in range (len(adjMatrix[i])):
            if (adjMatrix[i][j] != -1 and adjMatrix[i][j] != 0):
                g.add_edge(i, j, color = 'b', weight = adjMatrix[i][j])
            
    # Membuat layout tampilan, dibuat dengan seed agar gambar konstan
    pos = nx.spring_layout(g, seed = len(adjMatrix))
    # Menggambar simpul
    edges, colors = zip(*nx.get_edge_attributes(g, 'color').items())
    nx.draw(g, pos, edgelist = edges, edge_color = colors, with_labels = True, font_weight = 'bold')
    edge_weight = nx.get_edge_attributes(g, 'weight') # Get graph edges weights
    # Menggambar sisi yang menghubungkan
    nx.draw_networkx_edge_labels(g, pos, edge_labels = edge_weight)
    plt.show()
    
if __name__ == "__main__":
    app.run()