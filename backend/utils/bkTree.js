const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

class BKTreeNode {
  constructor(item) {
    this.item = item;
    this.children = {};
  }
  get term() {
    return this.item.name.toLowerCase();
  }
}

class BKTree {
  constructor() {
    this.root = null;
  }
  add(item) {
    const newNode = new BKTreeNode(item);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    let currentNode = this.root;
    while (true) {
      const dist = levenshteinDistance(currentNode.term, newNode.term);
      if (currentNode.children[dist]) {
        currentNode = currentNode.children[dist];
      } else {
        currentNode.children[dist] = newNode;
        break;
      }
    }
  }
  search(query, tolerance = 2) {
    if (!this.root) return [];
    const results = [];
    const normalizedQuery = query.toLowerCase();
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      const dist = levenshteinDistance(node.term, normalizedQuery);
      if (dist <= tolerance) results.push(node.item);
      const min = dist - tolerance;
      const max = dist + tolerance;
      for (const d in node.children) {
        if (parseInt(d) >= min && parseInt(d) <= max)
          stack.push(node.children[d]);
      }
    }
    return results;
  }
}
export default BKTree;
