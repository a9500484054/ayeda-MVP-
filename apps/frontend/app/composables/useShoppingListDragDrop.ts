import type { ShoppingList } from '~/shared/types/shopping.types';

interface DragState {
  isDragging: boolean;
  dragIndex: number;
  dragItem: ShoppingList | null;
}

export function useShoppingListDragDrop(lists: Ref<ShoppingList[]>, onReorder: (dragIndex: number, dropIndex: number) => Promise<void>) {
  const dragState = ref<DragState>({
    isDragging: false,
    dragIndex: -1,
    dragItem: null,
  });

  const dragStart = (index: number, item: ShoppingList) => {
    dragState.value = {
      isDragging: true,
      dragIndex: index,
      dragItem: item,
    };
  };

  const dragEnd = () => {
    dragState.value = {
      isDragging: false,
      dragIndex: -1,
      dragItem: null,
    };
  };

  const drop = async (dropIndex: number) => {
    if (!dragState.value.isDragging) return;
    if (dragState.value.dragIndex === dropIndex) return;

    const { dragIndex } = dragState.value;

    // Обновляем локальный порядок
    const newLists = [...lists.value];
    const [removed] = newLists.splice(dragIndex, 1);
    newLists.splice(dropIndex, 0, removed);

    // Вызываем callback для сохранения порядка
    await onReorder(dragIndex, dropIndex);
  };

  return {
    dragState,
    dragStart,
    dragEnd,
    drop,
  };
}
