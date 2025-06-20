 function createEventModal(creator, { update, create }) {
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

      const name = creator.createModalField({
        name: 'name',
        type: 'text',
        customClass: ["col-md-6"],
        label: 'Título',
        placeholder: 'Dê um nome objetivo ao seu conteúdo',
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
      

      const start_date = creator.createModalField({
        name: 'start_date',
        type: 'datetime-local',
        customClass: ["col-md-3"],
        label: 'Data inicial',
        placeholder: '',
        actions: {
          input: (e, el) => console.log('digitou start:', el.value)
        }
      });
        
      const end_date = creator.createModalField({
        name: 'end_date',
        type: 'datetime-local',
        customClass: ["col-md-3"],
        label: 'Data final',
        placeholder: '',
        actions: {
          input: (e, el) => console.log('digitou end:', el.value)
        }
      });
      
      const fields = [
        id,
        name,
        start_date,
        end_date,
        description,
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

      const getFieldsValues = () => fields.reduce(
        (acc, el) => ({ ...acc, [el.children[1].name]:el.children[1].value }),
        {
        });

      return [nootebookModal, createModalButtons, editModalButtons];
    }