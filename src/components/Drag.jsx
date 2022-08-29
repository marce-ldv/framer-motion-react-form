import { motion, useMotionValue, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { findIndex } from '../utils/find-index';
import { arrayMoveImmutable, arrayMoveMutable } from 'array-move';
import '../index.css';
// const input = [-200, 0, 200];
// const output = [0, 1, 0];

// function Drag() {
//   const x = useMotionValue(0);
//   const opacity = useTransform(x, input, output);

//   useEffect(() => {
//     x.set(100);
//   }, []);

//   useEffect(() => {
//     console.log(x.get());
//     console.log(x.getVelocity());
//   }, [x]);

//   return (
//     <>
//       <motion.div
//         drag="x"
//         style={{ x, opacity, backgroundColor: "red", width: 100, height: 100 }}
//       />
//       -
//       <motion.div
//         drag="x"
//         style={{ x, opacity, backgroundColor: "blue", width: 100, height: 100 }}
//       />
//     </>
//   );
// }
// export default Drag;

// Spring configs
const onTop = { zIndex: 1 };
const flat = {
  zIndex: 0,
  transition: { delay: 0.3 }
};

const initialColors = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF"];
const heights = {
  "#FF008C": 60,
  "#D309E1": 80,
  "#9C1AFF": 40,
  "#7700FF": 100
};

const Item = ({ color, setPosition, moveItem, i }) => {
  const [isDragging, setDragging] = useState(false);

  // We'll use a `ref` to access the DOM element that the `motion.li` produces.
  // This will allow us to measure its height and position, which will be useful to
  // decide when a dragging element should switch places with its siblings.
  const ref = useRef(null);

  // By manually creating a reference to `dragOriginY` we can manipulate this value
  // if the user is dragging this DOM element while the drag gesture is active to
  // compensate for any movement as the items are re-positioned.
  const dragOriginY = useMotionValue(0);

  // Update the measured position of the item so we can calculate when we should rearrange.
  useEffect(() => {
    setPosition(i, {
      height: ref.current.offsetHeight,
      top: ref.current.offsetTop,
    });
  });

  return (
    <motion.li
      ref={ref}
      initial={false}
      // If we're dragging, we want to set the zIndex of that item to be on top of the other items.
      animate={isDragging ? onTop : flat}
      style={{ background: color, height: heights[color] }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 1.12 }}
      drag="y"
      dragOriginY={dragOriginY}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={1}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      onDrag={(e, { point }) => moveItem(i, point.y)}
      positionTransition={({ delta }) => {
        if (isDragging) {
          // If we're dragging, we want to "undo" the items movement within the list
          // by manipulating its dragOriginY. This will keep the item under the cursor,
          // even though it's jumping around the DOM.
          dragOriginY.set(dragOriginY.get() + delta.y);
        }

        // If `positionTransition` is a function and returns `false`, it's telling
        // Motion not to animate from its old position into its new one. If we're
        // dragging, we don't want any animation to occur.
        return !isDragging;
      }}
    />
  );
};
// end item

const Drag = () => {
  const [colors, setColors] = useState(initialColors);

  // We need to collect an array of height and position data for all of this component's
  // `Item` children, so we can later us that in calculations to decide when a dragging
  // `Item` should swap places with its siblings.
  const positions = useRef([]).current;
  const setPosition = (i, offset) => (positions[i] = offset);

  const handleMoveArr = (arr, i, targetIndex) => {
    // const arr = colors.slice(i, targetIndex);
    // console.log('arr', arr);


    const dupArr = [...arr];
    const aux = dupArr[targetIndex];
    dupArr[targetIndex] = dupArr[i];
    dupArr[i] = aux;

    return dupArr;
  }

  // Find the ideal index for a dragging item based on its position in the array, and its
  // current drag offset. If it's different to its current index, we swap this item with that
  // sibling.
  const moveItem = (i, dragOffset) => {
    // console.log('positions', positions);
    const targetIndex = findIndex(i, dragOffset, positions);
    // console.log('target', targetIndex);
    // console.log('i', i);
    const newArr = arrayMoveImmutable(colors, i, targetIndex);
    console.log('newArr', newArr);
    if (targetIndex !== i) setColors(newArr);

    // const newArr = handleMoveArr(colors, i, targetIndex);
    // if (targetIndex !== i) setColors(newArr);
  };

  return (
    <ul>
      {colors.map((color, i) => (
        <Item
          key={color}
          i={i}
          color={color}
          setPosition={setPosition}
          moveItem={moveItem}
        />
      ))}
    </ul>
  );
};

export default Drag;

