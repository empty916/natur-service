# natur-service
natur action的调用层设计，用于聚合多个action成为一定的业务流，适用于复杂的业务场景，高级场景分离，可以更好的维护单个action，以及业务拓展


### demo

````typescript
// 你的natur store实例
import store from "your-natur-store-instance";
import NaturService from "natur-service";
import { InjectStoreModule, State } from "natur";

NaturService.store = store; // 配置store

class UserService extends NaturService {
  constructor() {
    super();
    this.store === store; // true

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
          this.dispatch("app/syncUserData", state);
          
          /**
           * 当重复执行推送，但是模块依然未加载，那么natur-service会将上一次的推送停止，并抛出以下错误
           * 以此来保证同样的类型的推送只保留最新的一次推送，防止堆栈溢出
           * {
           *  code: 0,
           *  message: 'stop the last dispath!'
           * }
           */
          this.dispatch("app/syncUserData", state);
        }
      }
    );

    this.getModule("user"); // 绑定user模块
    this.getModule("app"); // 绑定app模块
    this.app; // 获取app模块
  }

  fetchUserInfo() {
    return this.user.actions.fetchData().then(({ menu }) => {
      return this.app.actions.updateMenu(menu);
    });
  }

  getName() {
    return this.user.state.name;
  }

  removeName() {
    return this.user.actions.removeName();
  }
}

const userService = new UserService();

// 销毁
userService.destroy();
userService = null;


````