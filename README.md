# natur-service
natur action的调用层设计，用于聚合多个action成为一定的业务流，适用于复杂的业务场景，高级场景分离，可以更好的维护单个action，以及业务拓展


### demo

````typescript
// 你的natur store实例
import store from 'your-natur-store-instance';
import NaturService from 'natur-service';

NaturService.store = store; // 配置store

class UserService extends NaturService {
	constructor() {
		super();
		this.getModule('user', (moduleEvent: {type: 'init' | 'update' | 'remove', actionName: string}) => {
            // 当用户模块更新时的回调函数
            // this.user...
        }); // 绑定用户模块
		this.getModule('app'); // 绑定app模块
	}

	fetchUserInfo() {
        return this.user.actions.fetchData()
            .then(({menu}) => {
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


export default new UserService();


````