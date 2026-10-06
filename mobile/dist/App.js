"use strict";
/**
 * Kiini Mobile App
 * React Native Expo App Entry Point
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var react_1 = require("react");
var native_1 = require("@react-navigation/native");
var SplashScreen = require("expo-splash-screen");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var react_query_1 = require("@tanstack/react-query");
var client_1 = require("@trpc/client");
var react_query_2 = require("@trpc/react-query");
var superjson_1 = require("superjson");
var RootNavigator_1 = require("./navigation/RootNavigator");
var AuthContext_1 = require("./context/AuthContext");
var OnboardingContext_1 = require("./context/OnboardingContext");
var AppContext_1 = require("./context/AppContext");
var storage_1 = require("./utils/storage");
var constants_1 = require("./config/constants");
// Keep splash screen visible while we load
SplashScreen.preventAutoHideAsync();
// TRPC Setup
var queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            cacheTime: 1000 * 60 * 60 * 24
        }
    }
});
var trpcClient = react_query_2.createTRPCReact();
function getAuthToken() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_1.storage.getSecure(constants_1.STORAGE_KEYS.AUTH_TOKEN)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error retrieving auth token:", error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var trpc = trpcClient.createClient({
    links: [
        client_1.httpBatchLink({
            url: constants_1.API_URL + "/trpc",
            headers: function () {
                return __awaiter(this, void 0, void 0, function () {
                    var token;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getAuthToken()];
                            case 1:
                                token = _a.sent();
                                return [2 /*return*/, {
                                        authorization: token ? "Bearer " + token : undefined
                                    }];
                        }
                    });
                });
            }
        }),
    ],
    transformer: superjson_1["default"]
});
function App() {
    var _this = this;
    react_1.useEffect(function () {
        // Hide splash screen after app is ready
        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SplashScreen.hideAsync()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 1000);
    }, []);
    return (<react_native_safe_area_context_1.SafeAreaProvider>
      <react_query_1.QueryClientProvider client={queryClient}>
        <trpcClient.Provider client={trpc} queryClient={queryClient}>
          <AuthContext_1.AuthProvider>
            <OnboardingContext_1.OnboardingProvider>
              <AppContext_1.AppProvider>
                <native_1.NavigationContainer>
                  <RootNavigator_1["default"] />
                </native_1.NavigationContainer>
              </AppContext_1.AppProvider>
            </OnboardingContext_1.OnboardingProvider>
          </AuthContext_1.AuthProvider>
        </trpcClient.Provider>
      </react_query_1.QueryClientProvider>
    </react_native_safe_area_context_1.SafeAreaProvider>);
}
exports["default"] = App;
