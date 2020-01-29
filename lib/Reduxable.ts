import { Saga, SagaIterator } from '@redux-saga/types';
import { Action, Reducer } from 'redux';

export interface ReduxableState<T = any> {
    data: T;
    updated: {};
}

export type InternalReducer<S = any> = (state: S, action: Action) => S;

export interface ActionMap {
    [key: string]: Action;
}

export type ActionTypesFromActionMap<A extends ActionMap> = {[T in keyof A]: A[T]['type']}

/**
 * Abstract something something
 */
export abstract class Reduxable<S extends ReduxableState, A extends ActionMap, P extends any[] = []> {
    public abstract readonly actionMap: A;
    public abstract readonly actionTypeMap: ActionTypesFromActionMap<A>;
    public abstract readonly defaultState: S;
    public abstract readonly saga: Saga;
    public abstract readonly runSaga: (...arg: P) => SagaIterator<S>;

    protected abstract readonly internalReducer: InternalReducer<S>;

    private internalState?: S;

    public get actions(): A[keyof A] {
        throw new Error('Reduxable.actions should only be used as a TypeScript type provider (typeof .actions)');
    }

    public abstract run(...arg: P): Action;

    public get reducer(): Reducer<S> {
        const context: Reduxable<S, A, P> = this;

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
