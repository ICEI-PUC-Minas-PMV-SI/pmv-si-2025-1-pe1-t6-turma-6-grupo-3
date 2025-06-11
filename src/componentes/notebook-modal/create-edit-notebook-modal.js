 function createNotebookModal(creator, { create, update }, iconField) {
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

      const icon = iconField;

      const name = creator.createModalField({
        name: 'name',
        type: 'text',
        customClass: ["col-md-10"],
        label: 'Título',
        placeholder: 'Dê um nome claro ao seu Caderno',
        actions: {
          input: (e, el) => console.log('digitou nome:', el.value)
        }
      });

      const image = creator.createModalField({
        name: 'image',
        type: 'text',
        label: 'Imagem',
        placeholder: 'Adicione a url de uma imagem',
        actions: {
          input: (e, el) => console.log('digitou nome:', el.value)
        }
      });

      const description = creator.createModalTextarea({
        name:        'description',
        label:       'Descrição',
        placeholder: 'Descreva em poucas palavaras os objetivos desse caderno...',
        rows:        6,
        actions: {
          input: (e, el) => console.log('Conteúdo:', el.value)
        }
      });
      
      const fields = [
        id,
        icon,
        name,
        image,
        description,
      ];

      const fieldsWithoutIcon = [
        id,
        name,
        image,
        description,
      ];
      
      const btnCancelar = creator.createModalButton({
        text: 'Cancelar',
        isOutline: true,
        actions: { click: () => hideModal(nootebookModal) }
      });
      
      
      const btnNew = creator.createModalButton({
        text: "Criar Caderno",
        isPrimary: true,
        actions: { click: () => {
          const err = create(getFieldsValues());
          if (err) {
            alert(err.message)
            return
          }
          hideModal(nootebookModal);
        }}
      });

      const btnEdit = creator.createModalButton({
        text: "Atualizar Caderno",
        isPrimary: true,
        actions: { click: () => {
          const err = update(getFieldsValues());
          if (err) {
            alert(err.message)
            return
          }
          hideModal(nootebookModal);
        }}
      });
      
      const newModalButtons = [btnCancelar, btnNew];
      const editModalButtons = [btnCancelar, btnEdit];

      // 3) Cria o próprio modal
      const nootebookModal = creator.createModal({
        id:            'cadastroModal',
        title:         "Crie seu Novo Notebook",
        bodyElements:  fields,
        footerButtons: newModalButtons,
      });

      const getFieldsValues = () => fieldsWithoutIcon.reduce(
        (acc, el) => ({...acc, [el.children[1].name]:el.children[1].value }),
        {
          icon: iconField.children[1].children[1].value,
        });

      return [nootebookModal, newModalButtons, editModalButtons];
    }