export default (
    () => {
        const st: { [key: string]: any } = {};

        return {
            set: (key: string, object: any): void => {
                st[key] = object;
            },
            get: (key: string): any => {
                return st[key]
            },
            remove: (key: string): void => {
                delete st[key];
            }

        }
    }
)();