import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Web replacement for react-native-draggable-flatlist, used by every view
// that supports manual drag-to-reorder (List/Board columns/Matrix
// quadrants). Same reorder contract as the mobile views: the caller gets
// the full reordered array back and is responsible for translating that
// into its own mutation (e.g. `reorderTasks.mutate(...)`), exactly like
// DraggableFlatList's onDragEnd did. Cross-list dragging (e.g. moving a
// card between Board columns) is out of scope here too, matching the
// mobile app's own "not implemented yet" — each SortableTaskList instance
// is an independent DndContext.
function SortableRow({ id, disabled, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'relative z-10 opacity-70' : 'relative'}>
      {children({ dragHandleProps: { ...attributes, ...listeners }, isDragging })}
    </div>
  );
}

export function SortableTaskList({ items, onReorder, disabled = false, renderItem, className }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((t) => t._id === active.id);
    const newIndex = items.findIndex((t) => t._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((t) => t._id)} strategy={verticalListSortingStrategy} disabled={disabled}>
        <div className={className}>
          {items.map((item) => (
            <SortableRow key={item._id} id={item._id} disabled={disabled}>
              {({ dragHandleProps, isDragging }) => renderItem(item, { dragHandleProps, isDragging })}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
