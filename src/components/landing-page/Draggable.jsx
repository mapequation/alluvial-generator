export default function makeDraggable(Component) {
  return function Draggable(props) {
    const { action, index, children, ...rest } = props;

    const onDragStart = (e) => e.dataTransfer.setData("index", index);

    const onDragOver = (e) => e.preventDefault();

    const onDrop = (e) => {
      const fromIndex = e.dataTransfer.getData("index");
      action(parseInt(index, 10), parseInt(fromIndex, 10));
    };

    return (
      <Component
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        {...rest}
      >
        {children}
      </Component>
    );
  };
}
