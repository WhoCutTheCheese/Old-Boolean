
type Executor = () => Promise<void> | void;
import { promisify } from 'node:util';

export class ModuleBuilder {

	#name: string;
	#executor: Executor;

	setName(name: string): ModuleBuilder {
		this.#name = name;
		return this;
	}

	setExecutor(executor: Executor): ModuleBuilder {
		this.#executor = executor;
		return this;
	}

	name() { return this.#name; }

	execute() {
		return promisify(this.#executor)();
	}
}