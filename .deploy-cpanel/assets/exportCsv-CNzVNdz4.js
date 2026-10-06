function j(l,t,p){if(!t.length)return;const c=Object.keys(t[0]).map(e=>({key:e,label:e})),r=c.map(e=>`"${e.label}"`).join(","),a=t.map(e=>c.map(i=>{const s=e[i.key];return s==null?'""':`"${String(s).replace(/"/g,'""')}"`}).join(",")).join(`
`),b=`${r}
${a}`,u=new Blob([b],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(u),n=document.createElement("a");n.href=o,n.download=`${l}.csv`,n.click(),URL.revokeObjectURL(o)}export{j as e};
