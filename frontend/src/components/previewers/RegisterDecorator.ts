// export function registerDecorator(WrappedComponent: React.ComponentType<any>) {
// 	return (props: any) => {
// 		React.useEffect(() => {
// 			console.log(`Component ${WrappedComponent.name} mounted`);
//
// 			return () => {
// 				console.log(`Component ${WrappedComponent.name} unmounted`);
// 			};
// 		}, []);
//
// 		return <WrappedComponent {...props} />;
// 	};
// }

interface registerDecorator {}

// add a registry of the type you expect
namespace registerDecorator {
	type Constructor<T> = {
		new (...args: any[]): T;
		readonly prototype: T;
	};
	const implementations: Constructor<registerDecorator>[] = [];

	export function GetImplementations(): Constructor<registerDecorator>[] {
		return implementations;
	}

	export function register<T extends Constructor<registerDecorator>>(ctor: T) {
		implementations.push(ctor);
		return ctor;
	}
}

export function register(component: any) {
	// Register the component as desired
	registerDecorator.register(component);
}
