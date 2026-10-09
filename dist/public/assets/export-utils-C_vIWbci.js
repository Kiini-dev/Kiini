import{j as i}from"./index-CB2TZP-F.js";function v(t,s){if(!t.length){i.info("No data to export");return}const r=Object.keys(t[0]),a=t.map(c=>r.map(p=>{const n=c[p],o=n==null?"":String(n);return o.includes(",")||o.includes('"')||o.includes(`
`)?`"${o.replace(/"/g,'""')}"`:o})),d=[r.join(","),...a.map(c=>c.join(","))].join(`
`),u=new Blob([d],{type:"text/csv;charset=utf-8;"}),l=URL.createObjectURL(u),e=document.createElement("a");e.href=l,e.download=`${s}.csv`,e.click(),URL.revokeObjectURL(l),i.success(`Exported ${t.length} records to ${s}.csv`)}export{v as d};
