document.addEventListener("DOMContentLoaded", () => {
    const section1 = document.getElementById("section-1");
    const section2 = document.getElementById("section-2");
    const section3 = document.getElementById("section-3");
    const thankYou = document.getElementById("thank-you");

    const toSection2Button = document.getElementById("to-section-2");
    const toSection3Button = document.getElementById("to-section-3");
    const genreForm = document.getElementById("genre-questions");

    function showScrollDownPopup() {
        const popup = document.createElement("div");
        popup.textContent = "Scroll down to continue!";
        popup.style.position = "fixed";
        popup.style.bottom = "20px"; // Place at the bottom of the screen
        popup.style.left = "50%"; // Center horizontally
        popup.style.transform = "translateX(-50%)"; // Adjust for true centering
        popup.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Transparent dark background
        popup.style.color = "white";
        popup.style.padding = "10px 20px";
        popup.style.borderRadius = "5px";
        popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        popup.style.zIndex = "1000";
        popup.style.textAlign = "center";
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000); // Remove popup after 3 seconds
    }

    // Navigation logic
    toSection2Button.addEventListener("click", () => {
        section2.style.display = "block"; // Show section 2
        toSection2Button.style.display = "none"; // Hide the button after clicking
        showScrollDownPopup(); // Show popup
    });

    toSection3Button.addEventListener("click", () => {
        const selectedGenres = document.querySelectorAll("input[name='genre']:checked");
        if (selectedGenres.length > 3) {
            alert("You can select up to 3 genres only.");
            return;
        }

        section3.style.display = "block"; // Show section 3
        toSection3Button.style.display = "none"; // Hide the button after clicking
        showScrollDownPopup(); // Show popup

        // Show questions for selected genres
        selectedGenres.forEach(genre => {
            const genreSection = document.getElementById(`${genre.value}-Genre`);
            if (genreSection) {
                genreSection.style.display = "block";
            }
        });
    });

    // Form submission logic
    genreForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Collect data from Section 1
        const pseudonym = document.getElementById("pseudonym").value;
        const age = document.getElementById("age").value;
        const gender = document.getElementById("gender").value;
        const email = document.getElementById("email").value;
        const watchFrequency = document.getElementById("watch-frequency").value;
        const ugtQ1 = document.querySelector("select[name='ugt-q1']").value;
        const ugtQ2 = document.querySelector("select[name='ugt-q2']").value;

        // Collect data from Section 2
        const selectedGenres = Array.from(document.querySelectorAll("input[name='genre']:checked"))
            .map(genre => genre.value);

        // Collect data from Section 3
        const genreQuestions = {};
        selectedGenres.forEach(genre => {
            const genreInputs = document.querySelectorAll(`#${genre}-Genre input[type='radio']:checked`);
            genreQuestions[genre] = Array.from(genreInputs).map(input => input.value);
        });

        // Prepare data for API
        const data = {
            Pseudonym: pseudonym,
            Age: age,
            Gender: gender,
            Email: email,
            WatchFrequency: watchFrequency,
            UGT_Questions: JSON.stringify({ ugtQ1, ugtQ2 }),
            SelectedGenres: JSON.stringify(selectedGenres),
            GenreQuestions: JSON.stringify(genreQuestions)
        };

        try {
            // Send data to Google Sheet API
            const response = await fetch("https://sheetdb.io/api/v1/2cjorv61rowv1", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                section1.style.display = "none";
                section2.style.display = "none";
                section3.style.display = "none";
                thankYou.style.display = "block"; // Only show the thank-you page
            } else {
                alert("Failed to submit the survey. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting the survey:", error);
            alert("An error occurred while submitting the survey. Please try again.");
        }
    });
});

function calculatePersonality(answers) {
    const traits = {
        Openness: 0,
        Conscientiousness: 0,
        Extraversion: 0,
        Agreeableness: 0,
        Neuroticism: 0
    };

    // Iterate through answers and sum up scores for each trait
    for (const [key, value] of Object.entries(answers)) {
        if (key.includes('openness')) {
            traits.Openness += parseInt(value, 10);
        } else if (key.includes('conscientiousness')) {
            traits.Conscientiousness += parseInt(value, 10);
        } else if (key.includes('extraversion')) {
            traits.Extraversion += parseInt(value, 10);
        } else if (key.includes('agreeableness')) {
            traits.Agreeableness += parseInt(value, 10);
        } else if (key.includes('neuroticism')) {
            traits.Neuroticism += parseInt(value, 10);
        }
    }

    // Calculate average score for each trait
    const traitCounts = {
        Openness: 10, // Assuming 10 questions per trait
        Conscientiousness: 10,
        Extraversion: 10,
        Agreeableness: 10,
        Neuroticism: 10
    };

    for (const trait in traits) {
        traits[trait] = (traits[trait] / traitCounts[trait]).toFixed(2); // Average score
    }

    return traits;
}

// Example usage:
// const answers = {
//     'action-openness-1': '4',
//     'action-conscientiousness-1': '3',
//     'action-extraversion-1': '5',
//     'action-agreeableness-1': '2',
//     'action-neuroticism-1': '1',
//     ... // Other answers
// };
// const personality = calculatePersonality(answers);
// console.log(personality);
