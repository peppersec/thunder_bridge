function linearize(o, p, s) {
  res = "";
  for (let i in o) {
    if (typeof(o[i])==="object")
      res+=linearize(o[i], p+s+i, s);
    else if (typeof(o[i])==="string")
      res+=p+s+i+"="+o[i]+"\n";
    else
      res+=p+s+i+"="+JSON.stringify(o[i])+"\n";
  }
  return res;
};

module.exports = linearize;