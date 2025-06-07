class ShareEngine {
    constructor(shared_page) {
        this.shared_page = shared_page;   
    }

    parseToMD(user, notebook, meta, nodes) {
        return `
---------
user_name: ${user.name}
user_email: ${user.email}

notebook_name: ${notebook.name}
notebook_icon: ${notebook.icon}
notebook_description:
  ${notebook.description}

content_name: ${meta.name}
content_icon: ${meta.icon}
content_tags:
${meta.tags.map(t => `  - ${t.name} | ${t.color}`).join("\n")}
---------

${nodes.map(n => {
    switch(n.type) {
        case "h1": 
            return `# ${n.value}\n`
        
        case "paragraph": 
            return `${n.value}\n`;
        
        case "unordered_list": 
            return `${n.value.split("\t").map(value => `- ${value}`).join('\n')}\n`
        
        case "ordered_list": 
            return `${n.value.split("\t").map(value => `1. ${value}`).join('\n')}\n`
        
        case "ordered_action_list": 
            return `${n.value.split("\t").map(action_value => {
                const action = action_value[0] === '-';
                const value = action_value.slice(2);
                return `- ${action ? "[x]" : "[ ]"} ${value}`
            }).join('\n')}\n`

        case "unordered_action_list": 
            return `${n.value.split("\t").map(action_value => {
                const action = action_value[0] === '-';
                const value = action_value.slice(2);
                return `1. ${action ? "[x]" : "[ ]"} ${value}`
            }).join('\n')}\n`

        case "image": 
            const [url, alt] = n.value.split("\t")
            return `![${alt ? alt : "image"}](${url})\n`
    }
}).join("\n")}`
}

    getLink(user, notebook, meta, nodes) {
        const bulk = {
            user,
            notebook: {
                ...notebook,
                id: `shared-by-${user.email}-${notebook.id}`
            },
            content: {
                meta: {
                    ...meta,
                    notebook_id: `shared-by-${user.email}-${notebook.id}`,
                    id: `shared-by-${user.email}-${meta.id}`
                },
                nodes: nodes.map(n => ({
                    ...n,
                    notebook_id: `shared-by-${user.email}-${notebook.id}`,
                    content_id: `shared-by-${user.email}-${meta.id}`,
                    id: `shared-by-${user.email}-${n.id}`
                })),
            }
        };
        const bulk_json = JSON.stringify(bulk);
        const bulk_base64 = btoa(bulk_json);
        const url = `${this.shared_page}?bulk=${bulk_base64}`;
        return url;
    }

    fromLink(bulk_base64){
        console.log("bulk", bulk_base64)
        const bulk_json = atob(bulk_base64);
        const bulk = JSON.parse(bulk_json);
        return bulk;
    }
    // decode
}