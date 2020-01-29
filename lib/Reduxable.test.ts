import { Action, applyMiddleware, createStore, Reducer, Store } from 'redux';
import reduxSaga, { SagaIterator, SagaMiddleware } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { ActionTypesFromActionGeneratorMap, Reduxable, ReduxableState } from './Reduxable';

interface TestAction extends Action<'TEST'> {
    data: string;
}

interface TestState extends ReduxableState<string> {
    reducer: boolean;
}

type TestActions = {
    testAction(data: string): TestAction;
};

/**
 * Fixture to test Reduxable
 */
class Test extends Reduxable<TestState, TestActions, 'testAction'> {
    public actionGeneratorMap: TestActions = {
        testAction: (data: string): TestAction => ({ type: 'TEST', data }),
    };

    constructor() {
        super('testAction');
    }

    public get actionTypeMap(): ActionTypesFromActionGeneratorMap<TestActions> {
        return {
            testAction: 'TEST',
        };
    }

    public get defaultState(): TestState {
        return {
            data: '',
            reducer: false,
            updated: {},
        };
    }

    protected get internalReducer(): Reducer<TestState> {
        const context: Test = this;

        return (state: TestState = context.defaultState, action: Action): TestState => {
            const s: TestState = state.reducer ? state : { ...state, reducer: true };
            switch (action.type) {
                case 'TEST':
                    return {
                        ...s,
                        data: (<TestAction>action).data,
                    };
                default:
                    return s;
            }
        };
    }

    public get saga(): (() => Iterator<never>) {
        return function* (): Iterator<never> {/* Stub */};
    }

    public get runSaga(): (data: string) => SagaIterator<TestState> {
        const context: Test = this;

        return function* (data: string): SagaIterator<TestState> {
            // Fire request
            yield put(context.run(data));

            return context.state;
        };
    }
}

let a1: Test;
let store: Store<typeof a1.state>;
let sagaMiddleware: SagaMiddleware;

beforeEach(() => {
    a1 = new Test();
    sagaMiddleware = reduxSaga();
    store = createStore(
        a1.reducer,
        applyMiddleware(sagaMiddleware),
    );
    sagaMiddleware.run(a1.saga);
});

test('Should throw when accessing .actions', () => {
    expect(() => {
        console.log(a1.actions, 'never');
    }).toThrowError();
});

test('Should throw when accessing .actionMap', () => {
    expect(() => {
        console.log(a1.actionMap, 'never');
    }).toThrowError();
});

test('Should return action types from actionTypeMap', () => {
    expect(a1.actionTypeMap.testAction).toEqual('TEST');
});

test('Should set default state on the store', () => {
    expect(store.getState()).toEqual({ data: '', reducer: true, updated: {} });
});

test('Should return defaultState from .state before attach', () => {
    expect(new Test().state).toEqual({ data: '', reducer: false, updated: {} });
});

test('Should return new state from .state after processing action', () => {
    store.dispatch(a1.run('new state 194273'));
    expect(a1.state).toEqual({ data: 'new state 194273', reducer: true, updated: {} });
});

test('Should set new state on store after processing action', () => {
    store.dispatch(a1.run('new state 938271'));
    expect(store.getState()).toEqual({ data: 'new state 938271', reducer: true, updated: {} });
});

test('Should call .internalReducer when running .reducer', () => {
    const t: Test = new Test();
    expect(t.reducer(t.defaultState, t.run('some')).reducer).toEqual(true);
});
