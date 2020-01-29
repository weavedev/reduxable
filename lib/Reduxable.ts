import { Saga, SagaIterator } from '@redux-saga/types';
import { Action, Reducer } from 'redux';

export interface ReduxableState<T = any> {
    data: T;
    updated: {};
}

export type InternalReducer<S = any> = (state: S, action: Action) => S;

export type ActionGeneratorMap = {
    [key: string]: (...p: any[]) => Action;
};

export type ActionMap<A extends ActionGeneratorMap> = {[T in keyof A]: ReturnType<A[T]>};

export type ActionTypesFromActionGeneratorMap<A extends ActionGeneratorMap> = {[T in keyof A]: ReturnType<A[T]>['type']};

/**
 * Abstract something something
 */
export abstract class Reduxable<S extends ReduxableState, A extends ActionGeneratorMap, R extends keyof A> {
    public abstract readonly actionGeneratorMap: A;
    public abstract readonly actionTypeMap: ActionTypesFromActionGeneratorMap<A>;
    public abstract readonly defaultState: S;
    public abstract readonly saga: Saga;
    public abstract readonly runSaga: (...arg: Parameters<A[R]>) => SagaIterator<S>;

    protected abstract readonly internalReducer: InternalReducer<S>;

    private internalState?: S;
    private readonly runnerAction: R;

    constructor(runnerAction: R) {
        this.runnerAction = runnerAction;
    }

    public get actions(): ReturnType<A[keyof A]> {
        throw new Error('Reduxable.actions should only be used as a TypeScript type provider (typeof .actions)');
    }

    public get actionMap(): ActionMap<A> {
        throw new Error('Reduxable.actionMap should only be used as a TypeScript type provider (typeof .actionMap)');
    }

    public run(...arg: Parameters<A[R]>): ReturnType<A[R]> {
        return <ReturnType<A[R]>>this.actionGeneratorMap[this.runnerAction](...arg);
    }

    public get reducer(): Reducer<S> {
        const context: Reduxable<S, A, R> = this;

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
