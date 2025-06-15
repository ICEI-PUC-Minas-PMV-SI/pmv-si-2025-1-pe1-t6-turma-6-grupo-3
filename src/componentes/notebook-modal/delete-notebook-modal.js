function createDeleteNotebookModal(creator, { deleteFn }) {
    const id = creator.createModalField({
        name: 'id',
        type: 'text',
        label: 'id',
        customClass: ["hidden"],
        placeholder: 'Dê um nome claro ao seu Caderno',
        actions: {
            input: (e, el) => console.log('digitou nome:', el.value)
        },
    });


    const name = creator.createModalField({
        name: 'name',
        type: 'text',
        customClass: ["col-md-10"],
        label: 'Título',
        placeholder: 'Escreva o nome do seu caderno para confirmar a Exclusão',
        actions: {
            input: (e, el) => console.log('digitou nome:', el.value)
        },
    });
    
    const fields = [
        id,
        name,
    ];

    const btnCancelar = creator.createModalButton({
        text: 'Cancelar',
        isOutline: true,
        actions: { click: () => hideModal(nootebookModal) }
    });

    const btnDelete = creator.createModalSubmitButton({
        text: deleteNotebookDeleteTitle,
        isPrimary: true,
        actions: { click: () => {
            const err = deleteFn(getFieldsValues());
            if (err) {
            alert(err.message)
            return
            }
            hideModal(nootebookModal);
        }}
    });

    const deleteModalButtons = [btnCancelar, btnDelete];

    // 3) Cria o próprio modal
    const nootebookModal = creator.createModal({
        id:            'deleteCadernoModal',
        title:         deleteNotebookModalTitle,
        bodyElements:  fields,
        footerButtons: deleteModalButtons,
    });

    const getFieldsValues = () => fields.reduce(
        (acc, el) => ({...acc, [el.children[1].name]:el.children[1].value }),
        {},
    );

    return [nootebookModal, deleteModalButtons];
}