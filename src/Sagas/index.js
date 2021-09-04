import { takeLatest, put, spawn, debounce, retry } from 'redux-saga/effects';
import { searchSkillsRequest, searchSkillsSuccess, searchSkillsFailure } from '../Actions/actionCreators';
import { CHANGE_SEARCH_FIELD, SEARCH_SKILLS_REQUEST } from '../Actions/actionTypes';
import { searchSkills } from '../API/index';

function filterChangeSearchAction({type, payload}) {
    return type === CHANGE_SEARCH_FIELD && payload.search.trim() !== ''
}

// worker
function* handleChangeSearchSaga(action) {
    yield put(searchSkillsRequest(action.payload.search));
}

// watcher
function* watchChangeSearchSaga() {
    yield debounce(500, filterChangeSearchAction, handleChangeSearchSaga);
}

// worker
function* handleSearchSkillsSaga(action) {
    try {
        const retryCount = 3;
        const retryDelay = 1000; // ms
        const data = yield retry(retryCount, retryDelay, searchSkills, action.payload.search);
        yield put(searchSkillsSuccess(data));
    } catch (e) {
        yield put(searchSkillsFailure(e.message));
    }
}

// watcher
function* watchSearchSkillsSaga() {
    yield takeLatest(SEARCH_SKILLS_REQUEST, handleSearchSkillsSaga);
}

export default function* saga() {
    yield spawn(watchChangeSearchSaga);
    yield spawn(watchSearchSkillsSaga)
}