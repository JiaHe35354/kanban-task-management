import classes from "./Skeleton.module.css";

function SkeletonSidebarItem() {
  return (
    <li className={classes.skeletonSidebarItem}>
      <div className={classes.skeletonIcon}></div>
      <div className={classes.skeletonBar}></div>
    </li>
  );
}

export default SkeletonSidebarItem;
