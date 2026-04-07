import SkeletonTaskCard from "./SkeletonTaskCard";

import classes from "./Skeleton.module.css";

function SkeletonColumn() {
  return (
    <div className={classes.skeletonColumn}>
      <div className={classes.skeletonColumnHeader}></div>
      <SkeletonTaskCard />
      <SkeletonTaskCard />
      <SkeletonTaskCard />
      <SkeletonTaskCard />
      <SkeletonTaskCard />
    </div>
  );
}

export default SkeletonColumn;
