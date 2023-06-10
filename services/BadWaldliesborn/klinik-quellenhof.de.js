import scroll from "../../utils/scroll.js";
import print from "../../utils/print.js";
import save from "../../utils/save.js";

let klinikLindenplatzDe = async (cluster,page, positions, levels) => {
  try {
  
    await page.goto(
      "https://www.klinik-quellenhof.de/unsere-klinik/karriere/",
      {
        waitUntil: "load",
        timeout: 0,
      }
    );

    await scroll(page);

    //get all jobLinks
    const jobLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".stellenangebote-table-wrap a")).map(
        (el) => el.href
      );
    });

    let jobLinksOO = [
      jobLinks[0],
      jobLinks[2],
      jobLinks[4],
      jobLinks[6],
      jobLinks[8],
      jobLinks[10],
      jobLinks[12]

    ];

    console.log(jobLinksOO);
    // console.log(jobLinksOO)
    // console.log("asas")
    let allJobs = [];

    for (let jobLink of jobLinksOO) {
      cluster.queue(async ({ page }) => {
        let job = {
          title: "",
          location: "Bad Sassendorf, Bad Waldliesborn",
          hospital: "Klinik Quellenhof",
          link: "",
          level: "",
          position: "",
          republic: "North Rhine-Westphalia",
          city: "Bad Sassendorf",
          email:"",
        };

        await page.goto(jobLink, {
          waitUntil: "load",
          timeout: 0,
        });

        await page.waitForTimeout(1000);

        let title = await page.evaluate(() => {
          let ttitle = document.querySelector(".text h1");
          return ttitle ? ttitle.innerText : "";
        });
        job.title = title;
        //   console.log(title);

        let text = await page.evaluate(() => {
          return document.body.innerText;
        });
        //get level
        let level = text.match(/Facharzt|Chefarzt|Assistenzarzt/);
        let position = text.match(/arzt|pflege/);
        job.level = level ? level[0] : "";
        if (
          level == "Facharzt" ||
          level == "Chefarzt" ||
          level == "Assistenzarzt"
        ) {
          job.position = "artz";
        }
        if (position == "pflege" || (position == "Pflege" && !level in levels)) {
          job.position = "pflege";
          job.level = "Nicht angegeben";
        }
        // get link

        let link = await page.evaluate(() => {
          let lnk = document.querySelector(".cta-button a");
          return lnk ? lnk.href : null;
        });
        job.link = link;

        let email = await page.evaluate(() => {
          return document.body.innerText.match(/\w+\@\w+\W+\w+/) || "N/A";
        });
        job.email = String() + email
        
          if (positions.map(el => el.toLowerCase()).includes(job.position.toLowerCase())) {
          await save(job);
        }
      });
    }
  } catch (e) {
    print(e);
  }
};


export default klinikLindenplatzDe;
