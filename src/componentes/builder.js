const map = {
    "base-container": [createContainer],
    "base-header": [createHeader],
    "base-layout": [createLayout],
    "base-modal": [createModal, createModalButton, createModalField, createModalTextarea, createModalSubmitButton],
    "content-card": [createContentCard],
    "icons-selector": [createIconSelector],
    "notebook-card": [createNotebookCard],
    "tags-selector": [createTagInput],
    "search-input": [createSearchInput],
    "fullpage-calendar": [createFullPageCalendar]
};

function buildComponentsCreator(
    document, // DOM
    basepath, // "../"
    components,
) {
    let choosed_list
    if (components === "*") {
        choosed_list = Object.keys(map);
    } else {
        choosed_list = components;
    }

    const fetch_address = choosed_list.map(cp => [cp, `${basepath}/componentes/${cp}/${cp.split("-")[1]}.html`]);
    const promises = fetch_address.map(([cp, add]) => 
        fetch(add).then(res => res.text())
        .then(html => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            return wrapper;
        }).then(wrapper => 
            map[cp].map(
                fn => [fn.name,  (arg) => fn(document, wrapper, arg)]
            )
        )
    );

    return Promise.all(promises) 
        .then(mtz => mtz.reduce(
            (acc, list) => [...acc, ...list],[])
        )
        .then(list => list.reduce(
                (acc, nameFunc) => ({
                ...acc,
                [nameFunc[0]]: nameFunc[1]
            }), {})
        )
       
}