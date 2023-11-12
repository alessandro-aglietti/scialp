import { createHash } from "node:crypto";
import fs from "node:fs";
import imageUrls from "./imageUrls";
import axios from "axios";
import uniqWith from "lodash/uniqWith";

async function retrieveImage(imageUrl, imageName) {
  const _ = {
    _: new Date(),
    imageName,
    imageUrlSha256: createHash("sha256").update(imageUrl).digest("hex"),
  };

  try {
    const response = await axios({
      method: "get",
      url: imageUrl,
      responseType: "stream",
    });

    _.responseAt = new Date();
    _.imageFileName = `images/${imageName}.${imageUrl.slice(-3)}`;

    response.data.pipe(fs.createWriteStream(_.imageFileName));
    await new Promise((resolve, reject) => {
      response.data.on("end", resolve);
      response.data.on("error", reject); // or something like that. might need to close `hash`
    });
    _.pipedAt = new Date();

    _.imageHash = createHash("sha256")
      .update(fs.readFileSync(_.imageFileName))
      .digest("hex");
  } catch (e) {
    _.e = e;
  }

  return _;
}

async function index() {
  const result = await Promise.all(
    imageUrls.map(async (image) => {
      const imageName = `${image.imageNamePrefix}_${
        new Date().toISOString().split("T")[0]
      }_${image.imageHour}`;
      const _ = await retrieveImage(image.url, imageName);
      return {
        ...image,
        ..._,
      };
    }),
  );

  const images = JSON.parse(fs.readFileSync("images.json"));

  images.push(...result);

  const uniques = uniqWith(images, (a, b) => a.imageName === b.imageName);

  fs.writeFileSync(
    "images.json",
    JSON.stringify(
      uniques.sort((a, b) => a.imageName > b.imageName),
      null,
      2,
    ),
    "utf8",
  );

  return 0;
}

export default index;
