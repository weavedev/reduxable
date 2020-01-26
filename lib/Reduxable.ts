import { SagaIterator } from '@redux-saga/types';
import { Action, AnyAction, Reducer } from 'redux';

export interface ReduxableState<T = any> {
    data: T;
    updated: {};
}

export type InternalReducer<S = any> = (state: S, action: Action) => S;

/**
 * Abstract something something
 */
export abstract class Reduxable<S extends ReduxableState, P extends any[] = []> {
    public abstract readonly actions: AnyAction;
    public abstract readonly defaultState: S;
    public abstract readonly runSaga: (...arg: P) => SagaIterator<S>;

    protected abstract readonly internalReducer: InternalReducer<S>;

    private internalState?: S;

    public abstract run(...arg: P): AnyAction;

    public get reducer(): Reducer<S> {
        const context: Reduxable<S, P> = this;

        return (state: S = context.defaultState, action: Action): S => {
            return context.internalState = context.internalReducer(state, action);
        };
    }

    public get state(): S {
        if (this.internalState !== undefined) {
            return this.internalState;
        }

        return this.defaultState;
    }
}
