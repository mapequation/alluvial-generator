// @flow
declare type Predicate<T> = T => boolean;

declare type Branch<T> = {
    left: T,
    right: T,
}
