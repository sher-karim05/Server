import scroll from "../utils/scroll.js";
import print from "../utils/print.js";
import save from "../utils/save.js"
const zentern = async (cluster,page,positions,levels) => {
  try{
  let url =
    "https://salzetal.deutsche-rentenversicherung-reha-zentren.de/subsites/Salzetal/de/Navigation/04_Service/Stellenangebote/Stellenangebote_node.html";

  await page.goto(url, { timeout: 0, waitUntil: "load" });

  //scroll the page
  await scroll(page);
  await page.waitForTimeout(3000);
  //get all links
  let links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".odd > a")).map((el) => {
      if (el) {
        return el.href;
      }
    });
  });
  print(links);
  //slice the links
  //get all job details
  let allJobs = [];
  for (let link of links) {
    cluster.queue(async ({ page }) => {
    await page.goto(link, { timeout: 0, waitUntil: "load" });
    await page.waitForTimeout(5000);
    let job = {
      title: "",
      location: "",
      hospital: "Salzetalklinik der Deutsche Rentenversicherung",
      link: "",
      level: "",
      position: "",
      city: "Bad Salzuflen",
      email: "",
      republic: "North Rhine-Westphalia",
    };

    await scroll(page);
    job.title = await page.evaluate(() => {
      return document.querySelector("h1").innerText;
    });
    job.email = await page.evaluate(() => {
      if (document.querySelector("a[href^='mailto:']")) {
        return document.querySelector("a[href^='mailto:']").innerText;
      }
    });
    job.location = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          "div.rc_box_content.rc_box_content_special > p"
        )
      )
        .map((el) => el.innerText)
        .join(",")
        .split("\n")
        .slice(0, 2)
        .join(",");
    });
    let text = await page.evaluate(() => {
      return document.body.innerText;
    });

    //get level and positions
    let level = text.match(/Facharzt|Chefarzt|Assistenzarzt|Arzt|Oberarzt/);
    let position = text.match(/arzt|pflege/);
    job.level = level ? level[0] : "";
    if (
      level == "Facharzt" ||
      level == "Chefarzt" ||
      level == "Assistenzarzt" ||
      level == "Arzt" ||
      level == "Oberarzt"
    ) {
      job.position = "artz";
    }
    if (position == "pflege" || (position == "Pflege" && !level in levels)) {
      job.position = "pflege";
      job.level = "Nicht angegeben";
    }


    job.link = link;
    if (typeof job.link == "object") {
      job.link = job.link[0];
    }
    if(positions.map(el => el.toLowerCase()).includes(job.position.toLowerCase())){
      await save(job);
    }
    });
  } //end of for loop
}catch(err) {
  print(err);
}

};



export default zentern;
