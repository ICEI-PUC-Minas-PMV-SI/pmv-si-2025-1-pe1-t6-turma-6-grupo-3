function createDeleteContentModal(creator, { deleteFn }) {
    const id = creator.createModalField({
        name: 'id',
        type: 'text',
        label: 'id',
        customClass: ["hidden"],
        placeholder: 'Dê um nome claro ao seu Caderno',
        actions: {
            input: (e, el) => console.log('digitou nome:', el.value)
        }
    });

    const span = document.createElement("span");
    span.innerHTML = `
    <h4 style="color:red;">Atenção!</h4>
    <p>Você está prestes a deletar definitivamente seu conteúdo.</p>

    <p>Esta ação é <strong>IRREVERSÍVEL</strong></p>
    `;
    
    const fields = [
        id,
        span,
    ];

    const btnCancelar = creator.createModalButton({
        text: 'Cancelar',
        isOutline: true,
        actions: { click: () => hideModal(nootebookModal) }
    });

    const btnDelete = creator.createModalButton({
        text: "Deletar Conteúdo!",
        isPrimary: true,
        actions: { click: () => {
            const err = deleteFn(getFieldsValues());
            if (err) {
            alert(err.message);
            return
            }
            hideModal(nootebookModal);
        }}
    });

    const deleteModalButtons = [btnCancelar, btnDelete];

    // 3) Cria o próprio modal
    const nootebookModal = creator.createModal({
        id:            'deleteConteúdoModal',
        title:         "Confirmação de Exclusão",
        bodyElements:  fields,
        footerButtons: deleteModalButtons,
    });

    const getFieldsValues = () => ({ id: id.children[1].value });

    return [nootebookModal];
}