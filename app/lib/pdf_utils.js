import axios from 'axios';
import { jsPDF } from 'jspdf';
import sharp from 'sharp';

class PdfUtils {
  async generatePdfForTestSeries(data, filename) {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const verticalMargin = 10;
    const pageWidth = doc.internal.pageSize.width; // Total page width
    const margin = 10; // Margin size
    const contentHeight = pageHeight - 2 * verticalMargin;
    const contentWidth = pageWidth - 2 * margin; // Usable content width
    let yOffset = 0; // Vertical offset
    let questionIndex = 1;

    for (const week of data) {
      doc.setFontSize(16);
      yOffset = this._changeYOffset(yOffset, 30, contentHeight, doc);
      doc.text(`Week: ${week.id}`, margin, yOffset);
      yOffset = this._changeYOffset(yOffset, 10, contentHeight, doc);

      for (const question of week.questions) {
        const { meta, image } = question;

        if (meta.solution) {
          yOffset = this._changeYOffset(yOffset, 10, contentHeight, doc);
          // Add Question Index and Wrap Text for Question
          doc.setFontSize(12);
          const questionText = `Q ${questionIndex}: ${meta.question}`;
          const wrappedQuestion = doc.splitTextToSize(
            questionText,
            contentWidth,
          );
          doc.text(wrappedQuestion, margin, yOffset);
          yOffset = this._changeYOffset(
            yOffset,
            wrappedQuestion.length * 6,
            contentHeight,
            doc,
          );
          questionIndex++;

          // Add Options with Word Wrapping
          meta.options.forEach((option, index) => {
            const wrappedOption = doc.splitTextToSize(
              `${index + 1}. ${option}`,
              contentWidth - 10,
            );
            doc.text(wrappedOption, margin + 10, yOffset);

            yOffset = this._changeYOffset(
              yOffset,
              wrappedOption.length * 6,
              contentHeight,
              doc,
            );
          });

          // Add Correct Answer with Wrapping
          doc.setFont('helvetica', 'bold');
          const answerText = `Correct Answer: ${meta.correctAnswer}`;
          const wrappedAnswer = doc.splitTextToSize(answerText, contentWidth);
          doc.text(wrappedAnswer, margin, yOffset);

          yOffset = this._changeYOffset(
            yOffset,
            wrappedAnswer.length * 6,
            contentHeight,
            doc,
          );

          const solutionText = `Solution : ${meta.solution}`;
          const wrappedSolution = doc.splitTextToSize(
            solutionText,
            contentWidth,
          );
          doc.text(wrappedSolution, margin, yOffset);
          yOffset = this._changeYOffset(
            yOffset,
            wrappedSolution.length * 6,
            contentHeight,
            doc,
          );
        } else {
          try {
            yOffset = this._changeYOffset(yOffset, 10, contentHeight, doc);
            // Add Question Index and Wrap Text for Question
            doc.setFontSize(12);
            const questionText = `Q ${questionIndex}:`;
            const wrappedQuestion = doc.splitTextToSize(
              questionText,
              contentWidth,
            );
            doc.text(wrappedQuestion, margin, yOffset);
            questionIndex++;
            yOffset = this._changeYOffset(yOffset, 5, contentHeight, doc);
            const newYOffset = await this._addImageToPdf(
              image,
              yOffset,
              contentHeight,
              contentWidth,
              doc,
            );
            yOffset = newYOffset;
          } catch (err) {
            console.log(err);
          }
          // Calculate aspect ratio and dimensions to fill the content area
        }
        doc.setFont('helvetica', 'normal');
      }
    }

    doc.save(filename);
  }

  /**
   *
   * @param {string} url
   * @param {jsPDF} doc
   */
  async _addImageToPdf(url, yOffset, contentHeight, contentWidth, doc) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 5000,
      });
      const buffer = response.data;
      const imageData = Buffer.from(buffer);
      const metadata = await sharp(imageData).metadata();
      const finalSpecs = this._fitImageToPage(
        metadata.width,
        metadata.height,
        contentWidth,
        100,
      );
      if (yOffset + finalSpecs.height >= contentHeight) {
        doc = doc.addPage();
        yOffset = this._changeYOffset(0, 10, contentHeight, doc);
      }
      doc.addImage(
        imageData.toString('base64'),
        'JPEG',
        10,
        yOffset,
        finalSpecs.width,
        finalSpecs.height,
      );
      yOffset = this._changeYOffset(
        yOffset,
        finalSpecs.height + 2,
        contentHeight,
        doc,
      );

      return yOffset;
    } catch (err) {
      console.log(err);
    }
  }

  _fitImageToPage(originalWidth, originalHeight, maxWidth, maxHeight) {
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    // Adjust dimensions based on maxWidth and maxHeight
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return { width: Math.floor(newWidth), height: Math.floor(newHeight) };
  }

  _changeYOffset(yOffset, value, maxContentHeight, doc) {
    const newVal = yOffset + value;
    if (newVal >= maxContentHeight) {
      doc.addPage();

      return 10;
    }

    return newVal;
  }
}

export default new PdfUtils();
