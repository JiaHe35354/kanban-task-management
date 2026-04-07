import classes from "./Skeleton.module.css";

function SkeletonTaskCard() {
  return (
    <div className={classes.skeletonTaskCard}>
      <div className={`${classes.skeletonPulse} ${classes.skeletonTask}`}></div>

      <div
        className={`${classes.skeletonPulse} ${classes.skeletonSubtask}`}
      ></div>
    </div>
  );
}

export default SkeletonTaskCard;
