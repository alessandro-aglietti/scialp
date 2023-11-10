async function retrieveImage(){
    const _p = new Promise((resolve) => {
        setTimeout(() => resolve("that's ok!"), 1000);
    });

    return _p;
}

async function index(){
    const _ = await retrieveImage();
    console.log(_, new Date());

    return 0;
}

export default index;
