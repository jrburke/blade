/*
  Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
  Available via the new BSD license.
  see: http://github.com/jrburke/blade for details
*/
run.modify(
  "_.node",
  "_.ie.node",
  ["_.node"],
  function(node) {
    node.empty = function(n){
      n = node(n);
      for(var c; (c = n.lastChild);){ // intentional assignment
              node.destroy(c);
      }
    }
    _.enhance("empty", node.empty, true);
  }
);
