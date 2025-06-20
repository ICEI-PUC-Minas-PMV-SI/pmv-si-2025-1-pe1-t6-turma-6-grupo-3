 function createContentModal(creator, { update, create }, iconField, tagsField) {
      const id = creator.createModalField({
        name: 'id',
        type: 'text',
        label: 'id',
        customClass: ["hidden"],
        placeholder: 'Dê um nome objetivo ao seu conteúdo',
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
        placeholder: 'Dê um nome objetivo ao seu conteúdo',
        actions: {
          input: (e, el) => console.log('digitou nome:', el.value)
        }
      });
      
      const tags = tagsField;
      const due_date = creator.createModalField({
        name: 'due_date',
        type: 'date',
        customClass: ["col-md-2"],
        label: 'Prazo',
        placeholder: 'Dê um prazo para o seu Conteúdo',
        actions: {
          input: (e, el) => console.log('digitou prazo:', el.value)
        }
      });
      const fields = [
        id,
        icon,
        name,
        tags,
        due_date,
      ];

      const fieldsWithoutIcon = [
        id,
        name,
        due_date,
      ];
      
      const btnCancelar = creator.createModalButton({
        text: 'Cancelar',
        isOutline: true,
        actions: { click: () => hideModal(nootebookModal) }
      });

      const btnEdit = creator.createModalSubmitButton({
        text: "Atualizar Conteúdo",
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

      const btnCreate = creator.createModalSubmitButton({
        text: "Criar Conteúdo",
        isPrimary: true,
        actions: { click: (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("...ACTION CRIAR", e)
          const err = create(getFieldsValues());
          if (err) {
            alert(err.message)
            return
          }
          hideModal(nootebookModal);
        }}
      });

      const editModalButtons = [btnCancelar, btnEdit];
      const createModalButtons = [btnCancelar, btnCreate];

      // 3) Cria o próprio modal
      const nootebookModal = creator.createModal({
        id:            'createEditMetaContentModal',
        title:         "Crie seu Novo Notebook",
        bodyElements:  fields,
        footerButtons: editModalButtons,
      });

      const getFieldsValues = () => fieldsWithoutIcon.reduce(
        (acc, el) => ({ ...acc, [el.children[1].name]:el.children[1].value }),
        {
          icon: iconField.children[1].children[1].value,
          tags: tagsField.getTags(),
        });

      return [nootebookModal, createModalButtons, editModalButtons];
    }