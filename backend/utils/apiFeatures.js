const { model } = require("mongoose");

class ApiFeatures{
    constructor(quary,quarystr){
        this.quary=quary;
        this.quarystr=quarystr;
    }

    search(){
        const key = this.quarystr.keyword ? {
            name : {
                $regex:this.quarystr.keyword,
                $options: "i",
            },
        }
        :{};

        this.quary=this.quary.find(key);
        return this;
    }

    filter(){
        let quarystrCopy={...this.quarystr};

        // Category Filter
        let key=quarystrCopy.category ? {
            category : quarystrCopy.category
        }:{};

        // Price Range Filter
        const str=JSON.stringify(quarystrCopy);
        quarystrCopy=JSON.parse(str.replace(/\b(gt|gte|lt|lte)\b/g,key=> `$${key}`));

        if(quarystrCopy.price){
            key.price=quarystrCopy.price;
        }

        if(quarystrCopy.ratings){
            key.ratings=quarystrCopy.ratings;
        }

        this.quary=this.quary.find(key);
        return this;
    }

    pagination(itemPerPage){
        const currPage=(this.quarystr.page) || 1;
        const skip=itemPerPage * (currPage - 1);

        this.quary=this.quary.limit(itemPerPage).skip(skip);
        return this;
    }
};

module.exports = ApiFeatures;