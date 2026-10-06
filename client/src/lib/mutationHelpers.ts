export function mutateAsync(mutation: any, payload?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // Note: Don't pass callbacks here as they're already defined in the mutation config
      // Just call mutate with the payload
      const promise = mutation.mutateAsync(payload);
      
      if (promise instanceof Promise) {
        promise
          .then((data: any) => resolve(data))
          .catch((err: any) => reject(err));
      } else {
        reject(new Error("Mutation did not return a promise"));
      }
    } catch (err) {
      reject(err);
    }
  });
}

export default mutateAsync;
