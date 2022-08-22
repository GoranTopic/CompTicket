const weight_combinator = (length, limit = 25) => {
    let weights = Array(length).fill(0);
    let last = weights.length - 1;
    let combinations = [];

    const total = arr => arr.reduce((t, s, i) => {
        if (i === last) return t
        else return t + s
    });

    const raise_one = arr => {
        for (var i = 0; i <= last - 1; i) {
            arr[i]++
            let t = total(arr);
            if (t > limit) {
                arr[i] = 0;
                if (i === last - 1) return true //reached end
                i++;
            } else {
                if (t <= limit) arr[last] = limit - t;
                return false; // not reached end
            }
        }
    }

    let endReached = false;
    while (!endReached) {
        endReached = raise_one(weights);
        combinations.push([...weights]);
    }
    return combinations;
}

//weight_combinator(4, 100) // example
export default weight_combinator;