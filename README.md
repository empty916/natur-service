# natur-service
natur action的调用层设计，用于聚合多个action成为一定的业务流，适用于复杂的业务场景，高级场景分离，可以更好的维护单个action，以及业务拓展


### demo

````typescript
// 你的natur store实例
import store from "your-natur-store-instance";
import NaturService from "natur-service";
import { InjectStoreModule, State } from "natur";

class UserService extends NaturService<typeof store.type> {
  // you must override the getStore function
  // 你必须重写getStore方法，返回你的store实例
  getStore() {
    return store;
  }
  constructor() {
    super();
    // 获取store实例
    this.getStore();
    // 观察用户模块
    this.watch("user", (moduleEvent: {
        type: "init" | "update" | "remove"; // user模块变更类型，详情请看natur文档
        actionName: string; // 触发user变更的action名字
        state: State; // 新的user state
        oldModule: InjectStoreModule; // 旧的user模块
        newModule: InjectStoreModule; // 新的user模块
      }) => {
        // 当用户模块发生变化时的回调函数
        if (state) {
          // 这里的dispatch不同于natur的dispatch，它可以推送还未加载的懒加载模块，或者未配置的手动加载模块
          this.dispatch("app", "syncUserData", state);
          
          /**
           * 当重复执行推送，但是模块依然未加载，那么natur-service会将上一次的推送停止，并抛出以下错误
           * {
           *  code: 0,
           *  message: 'stop the last dispath!'
           * }
           * 以此来保证同样的类型的推送只保留最新的一次推送，防止堆栈溢出, 
           * 如果你不喜欢抛出错误的处理，那么你可以重写此方法
           */
          this.dispatch("app", "syncUserData", state);
        }
      }
    );
  }
  // 其他业务逻辑
}

const userService = new UserService();

// 销毁
userService.destroy();
userService = null;


````


### NOTE

- 你不应该在store的模块中使用service，因为service的初始化依赖store的初始化，会导致循环引用问题
- You should not use service in the store module, because the initialization of the service depends on the initialization of the store, which will cause circular references.