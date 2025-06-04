class ShareEngine {
    constructor(shared_page) {
        this.shared_page = shared_page;   
    }

    // encode
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