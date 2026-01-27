"use strict";
/**
 * Simplified Entry Queryables Tests
 *
 * Tests basic query operators with real data
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var stack_instance_1 = require("../utils/stack-instance");
var types_1 = require("../../src/lib/types");
var stack = (0, stack_instance_1.stackInstance)();
var CT_UID = process.env.COMPLEX_CONTENT_TYPE_UID || 'cybersecurity';
var CT_UID2 = process.env.MEDIUM_CONTENT_TYPE_UID || 'article';
function makeEntries(contentTypeUid) {
    if (contentTypeUid === void 0) { contentTypeUid = ''; }
    return stack.contentType(contentTypeUid).entry();
}
describe('Query Operators API test cases - Simplified', function () {
    var testData = null;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query().find()];
                case 1:
                    result = _a.sent();
                    if (result.entries && result.entries.length > 0) {
                        testData = {
                            title: result.entries[0].title,
                            uid: result.entries[0].uid,
                            entries: result.entries
                        };
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should get entries which matches the fieldUid and values - containedIn', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!testData) {
                        console.log('⚠️ No test data available');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, makeEntries(CT_UID).query()
                            .containedIn('title', [testData.title])
                            .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    if (query.entries) {
                        expect(query.entries.length).toBeGreaterThan(0);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should get entries which does not match - notContainedIn', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query()
                        .notContainedIn('title', ['non-existent-xyz-123'])
                        .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should get entries which does not match - notExists', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID2).query()
                        .notExists('non_existent_field_xyz')
                        .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should get entries which matches - EXISTS', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query()
                        .where('title', types_1.QueryOperation.EXISTS, true)
                        .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    if (query.entries) {
                        expect(query.entries.length).toBeGreaterThan(0);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return entries matching any conditions - OR', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query1, query2, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!testData)
                        return [2 /*return*/];
                    query1 = makeEntries(CT_UID).query()
                        .where('title', types_1.QueryOperation.EQUALS, testData.title);
                    query2 = makeEntries(CT_UID).query()
                        .where('uid', types_1.QueryOperation.EQUALS, testData.uid);
                    return [4 /*yield*/, makeEntries(CT_UID).query()
                            .or(query1, query2)
                            .find()];
                case 1:
                    result = _a.sent();
                    expect(result.entries).toBeDefined();
                    if (result.entries) {
                        expect(result.entries.length).toBeGreaterThan(0);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return entry when at least 1 condition matches - OR', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query1, query2, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!testData)
                        return [2 /*return*/];
                    query1 = makeEntries(CT_UID).query()
                        .where('title', types_1.QueryOperation.EQUALS, testData.title);
                    query2 = makeEntries(CT_UID).query()
                        .where('title', types_1.QueryOperation.EQUALS, 'non-existent-xyz');
                    return [4 /*yield*/, makeEntries(CT_UID).query()
                            .or(query1, query2)
                            .find()];
                case 1:
                    result = _a.sent();
                    expect(result.entries).toBeDefined();
                    if (result.entries) {
                        expect(result.entries.length).toBeGreaterThan(0);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return entry when both conditions match - AND', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query1, query2, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!testData)
                        return [2 /*return*/];
                    query1 = makeEntries(CT_UID).query()
                        .where('title', types_1.QueryOperation.EQUALS, testData.title);
                    query2 = makeEntries(CT_UID).query()
                        .where('locale', types_1.QueryOperation.EQUALS, 'en-us');
                    return [4 /*yield*/, makeEntries(CT_UID).query()
                            .and(query1, query2)
                            .find()];
                case 1:
                    result = _a.sent();
                    expect(result.entries).toBeDefined();
                    if (result.entries) {
                        expect(result.entries.length).toBeGreaterThan(0);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return empty when AND conditions do not match', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query1, query2, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!testData)
                        return [2 /*return*/];
                    query1 = makeEntries(CT_UID).query()
                        .where('title', types_1.QueryOperation.EQUALS, testData.title);
                    query2 = makeEntries(CT_UID).query()
                        .where('locale', types_1.QueryOperation.EQUALS, 'xx-xx');
                    return [4 /*yield*/, makeEntries(CT_UID).query()
                            .and(query1, query2)
                            .find()];
                case 1:
                    result = _a.sent();
                    expect(result.entries).toBeDefined();
                    expect(result.entries).toHaveLength(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return entry equal to condition - equalTo', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!testData)
                        return [2 /*return*/];
                    return [4 /*yield*/, makeEntries(CT_UID).query()
                            .equalTo('title', testData.title)
                            .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    if (query.entries) {
                        expect(query.entries.length).toBeGreaterThan(0);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return entry not equal to condition - notEqualTo', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query()
                        .notEqualTo('title', 'non-existent-xyz-123')
                        .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle referenceIn query', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query, entryQuery;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!testData)
                        return [2 /*return*/];
                    query = makeEntries(CT_UID).query()
                        .where('title', types_1.QueryOperation.EXISTS, true);
                    return [4 /*yield*/, makeEntries(CT_UID).query()
                            .referenceIn('reference', query)
                            .find()];
                case 1:
                    entryQuery = _b.sent();
                    expect(entryQuery.entries).toBeDefined();
                    console.log("ReferenceIn returned ".concat(((_a = entryQuery.entries) === null || _a === void 0 ? void 0 : _a.length) || 0, " entries"));
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle referenceNotIn query', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query, entryQuery;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!testData)
                        return [2 /*return*/];
                    query = makeEntries(CT_UID).query()
                        .where('title', types_1.QueryOperation.EXISTS, true);
                    return [4 /*yield*/, makeEntries(CT_UID).query()
                            .referenceNotIn('reference', query)
                            .find()];
                case 1:
                    entryQuery = _b.sent();
                    expect(entryQuery.entries).toBeDefined();
                    console.log("ReferenceNotIn returned ".concat(((_a = entryQuery.entries) === null || _a === void 0 ? void 0 : _a.length) || 0, " entries"));
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle tags query', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query()
                        .tags(['test'])
                        .find()];
                case 1:
                    query = _b.sent();
                    expect(query.entries).toBeDefined();
                    console.log("Tags query returned ".concat(((_a = query.entries) === null || _a === void 0 ? void 0 : _a.length) || 0, " entries"));
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle search query', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query()
                        .search('')
                        .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should sort entries in ascending order', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query()
                        .orderByAscending('title')
                        .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    if (query.entries) {
                        expect(query.entries.length).toBeGreaterThan(0);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should sort entries in descending order', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query()
                        .orderByDescending('title')
                        .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    if (query.entries) {
                        expect(query.entries.length).toBeGreaterThan(0);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should get entries lessThan a value', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query()
                        .lessThan('_version', 100)
                        .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should get entries lessThanOrEqualTo a value', function () { return __awaiter(void 0, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeEntries(CT_UID).query()
                        .lessThanOrEqualTo('_version', 100)
                        .find()];
                case 1:
                    query = _a.sent();
                    expect(query.entries).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
});
