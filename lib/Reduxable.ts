import { Saga, SagaIterator } from '@redux-saga/types';
import { Action, AnyAction, Reducer } from 'redux';

export interface ReduxableState<T = any> {
    data: T;
    updated: {};
}

export type InternalReducer<S = any> = (state: S, action: Action) => S;

export interface ActionMap {
    [key: string]: AnyAction;
}

/**
 * Abstract something something
 */
export abstract class Reduxable<S extends ReduxableState, P extends any[] = []> {
    public abstract readonly actionMap: ActionMap;
    public abstract readonly defaultState: S;
    public abstract readonly saga: Saga;
    public abstract readonly runSaga: (...arg: P) => SagaIterator<S>;

    protected abstract readonly internalReducer: InternalReducer<S>;

    private internalState?: S;

    public get actions(): ActionMap[keyof ActionMap] {
        throw new Error('ReduxAsync.actions should only be used as a TypeScript type provider (typeof .actions)');
    }

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
